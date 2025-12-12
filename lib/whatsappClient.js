const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); // Local instance for the worker

let chromium;
let puppeteer;

// Global client container (still useful for the active thread)
let client = null;

const initializeClient = async (userId) => {
    if (client) return;

    try {
        console.log('Initializing Real WhatsApp Client (DB Persisted)...');

        // 1. Set Status in DB
        await prisma.user.update({
            where: { id: userId },
            data: { waStatus: 'Iniciando Browser...', waQrCode: null }
        });

        // Dynamic import for Vercel environment
        if (process.env.AWS_LAMBDA_FUNCTION_VERSION || process.env.VERCEL) {
            chromium = require('@sparticuz/chromium');
            puppeteer = require('puppeteer-core');
        } else {
            try {
                puppeteer = require('puppeteer');
            } catch (e) { }
        }

        let browserOptions = {};

        if (process.env.AWS_LAMBDA_FUNCTION_VERSION || process.env.VERCEL) {
            browserOptions = {
                args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
                ignoreHTTPSErrors: true,
            };
        } else {
            browserOptions = {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            };
        }

        client = new Client({
            authStrategy: new LocalAuth({ clientId: userId }),
            puppeteer: browserOptions
        });

        client.on('qr', async (qr) => {
            console.log('Real QR Received');
            const url = await qrcode.toDataURL(qr);

            // Persist QR to DB immediately
            await prisma.user.update({
                where: { id: userId },
                data: { waStatus: 'QR_READY', waQrCode: url }
            });
        });

        client.on('ready', async () => {
            console.log('Real Client is ready!');
            await prisma.user.update({
                where: { id: userId },
                data: { waStatus: 'READY', waQrCode: null }
            });
        });

        client.on('authenticated', async () => {
            await prisma.user.update({
                where: { id: userId },
                data: { waStatus: 'AUTHENTICATED' }
            });
        });

        client.on('disconnected', async (reason) => {
            console.log('Client Disconnected', reason);
            client = null;
            await prisma.user.update({
                where: { id: userId },
                data: { waStatus: 'DISCONNECTED', waQrCode: null }
            });
        });

        await client.initialize();

    } catch (e) {
        console.error('Fatal Client Init Error:', e);
        await prisma.user.update({
            where: { id: userId },
            data: { waStatus: 'ERROR: ' + e.message }
        });
    }
};

const destroyClient = async (userId) => {
    if (client) {
        await client.destroy();
        client = null;
    }
    // Always update DB
    if (userId) {
        await prisma.user.update({
            where: { id: userId },
            data: { waStatus: 'DISCONNECTED', waQrCode: null }
        });
    }
};

const sendMessage = async (userId, to, message) => {
    // Check DB status first for robustness
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user?.waStatus !== 'READY' && !client) {
        throw new Error('WhatsApp client not ready. Scan REAL QR first.');
    }

    // 2. Format Number
    let chatId = to.includes('@c.us') ? to : `${to}@c.us`;
    if (!to.includes('@')) chatId = `${to.replace(/\D/g, '')}@c.us`;

    // 3. Real Send
    if (client) {
        try {
            console.log(`sending to ${chatId}`);
            const msg = await client.sendMessage(chatId, message);
            return { sid: msg.id.id };
        } catch (e) {
            console.error('Real Send Failed:', e);
            throw e;
        }
    } else {
        throw new Error('Process detached. Cannot send in Vercel. Use Docker.');
    }
};

// Stub getters for minimal compat, but consumers should read DB
const getStatus = () => ({ status: 'CHECK_DB', qr: null });
const getClient = () => client;

module.exports = { getClient, getStatus, initializeClient, destroyClient, sendMessage };
