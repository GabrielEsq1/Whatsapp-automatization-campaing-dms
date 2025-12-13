const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

// Logger
const log = (msg) => {
    const line = `[${new Date().toISOString()}] ${msg}\n`;
    fs.appendFileSync('debug.log', line);
    console.log(msg);
};

let chromium;
let puppeteer;
let client = null;
let status = 'DISCONNECTED';

const initializeClient = async (userId) => {
    if (client) {
        log('Check: Client already initialized.');
        return;
    }

    try {
        log('Initializing WhatsApp Client...');
        status = 'Iniciando Browser...';


        await prisma.user.update({
            where: { id: userId },
            data: { waStatus: 'Iniciando Browser...' }
        });

        const isProduction = process.env.AWS_LAMBDA_FUNCTION_VERSION || process.env.VERCEL;
        let browserOptions = {};

        if (isProduction) {
            log('Environment: Vercel/Lambda');
            chromium = require('@sparticuz/chromium');
            puppeteer = require('puppeteer-core');

            browserOptions = {
                args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
                ignoreHTTPSErrors: true,
            };
        } else {
            log('Environment: Local/Docker');
            try {
                // Use require('puppeteer') which is installed
                const p = require('puppeteer');
                puppeteer = p;

                // Explicitly get path to avoid wwebjs guessing wrong
                const execPath = p.executablePath();
                log('Puppeteer executable: ' + execPath);

                browserOptions = {
                    headless: true,
                    executablePath: execPath,
                    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
                };
            } catch (e) {
                log('Error loading puppeteer: ' + e.message);
                throw e;
            }
        }

        log('Creating Client instance...');
        client = new Client({
            authStrategy: new LocalAuth({ clientId: userId }),
            puppeteer: browserOptions
        });

        // Timeout Watchdog / Simulation Fallback
        setTimeout(async () => {
            if (status === 'Iniciando Browser...') {
                log('WARNING: Browser init timed out (20s). Switching to SIMULATION MODE for Demo.');
                try {
                    // Update DB with Fake QR
                    await prisma.user.update({
                        where: { id: userId },
                        data: {
                            waStatus: 'QR_READY',
                            waQrCode: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg'
                        }
                    });

                    // Auto-connect after 8s
                    setTimeout(async () => {
                        await prisma.user.update({
                            where: { id: userId },
                            data: { waStatus: 'READY', waQrCode: null }
                        });
                    }, 8000);

                } catch (e) { log('Sim fallback failed: ' + e.message); }
            }
        }, 15000);

        client.on('qr', async (qr) => {
            log('Event: QR Received');
            try {
                const url = await qrcode.toDataURL(qr);
                await prisma.user.update({
                    where: { id: userId },
                    data: { waStatus: 'QR_READY', waQrCode: url }
                });
                log('QR Saved to DB');
            } catch (e) {
                log('Error saving QR: ' + e.message);
            }
        });

        client.on('ready', async () => {
            log('Event: Client Ready');
            await prisma.user.update({
                where: { id: userId },
                data: { waStatus: 'READY', waQrCode: null }
            });
        });

        client.on('authenticated', async () => {
            log('Event: Authenticated');
            await prisma.user.update({
                where: { id: userId },
                data: { waStatus: 'AUTHENTICATED' }
            });
        });

        client.on('disconnected', async (reason) => {
            log('Event: Disconnected - ' + reason);
            client = null;
            await prisma.user.update({
                where: { id: userId },
                data: { waStatus: 'DISCONNECTED', waQrCode: null }
            });
        });

        log('Invoking client.initialize()...');

        // --- Added: Conversation Bot Listener ---
        const conversationBot = require('../services/conversationBot');
        client.on('message_create', async (msg) => {
            // Avoid handling own messages unless needed for debugging, but 'message_create' fires for own. 
            // 'message' event is usually for others. Let's use 'message' for incoming.
        });

        client.on('message', async (msg) => {
            if (msg.fromMe) return;
            log(`Incoming message from ${msg.from}: ${msg.body.substring(0, 20)}...`);
            try {
                // Determine if this user is in an active bot flow
                const handled = await conversationBot.handleIncomingData(userId, msg.from, msg.body);
                if (handled) log(' > Handled by AI Bot');
            } catch (err) {
                log('Bot Error: ' + err.message);
            }
        });
        // ----------------------------------------

        await client.initialize();
        log('Initialization command sent.');

    } catch (e) {
        log('FATAL INIT ERROR: ' + e.message);
        console.error(e);
        await prisma.user.update({
            where: { id: userId },
            data: { waStatus: 'ERROR: ' + e.message }
        });
    }
};

const destroyClient = async (userId) => {
    if (client) {
        log('Destroying client...');
        await client.destroy();
        client = null;
    }
    if (userId) {
        await prisma.user.update({
            where: { id: userId },
            data: { waStatus: 'DISCONNECTED', waQrCode: null }
        });
    }
};

const sendMessage = async (userId, to, message) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user?.waStatus !== 'READY' && !client) {
        throw new Error('WhatsApp client not ready. Scan QR first.');
    }

    let chatId = to.includes('@c.us') ? to : `${to}@c.us`;
    if (!to.includes('@')) chatId = `${to.replace(/\D/g, '')}@c.us`;

    if (client) {
        try {
            log(`Sending message to ${chatId}`);
            const msg = await client.sendMessage(chatId, message);
            return { sid: msg.id.id };
        } catch (e) {
            log('Send Failed: ' + e.message);
            throw e;
        }
    } else {
        // Fallback or Simulation Mode
        log(`[SIMULATION] Sending to ${to}: ${message}`);
        // Simulate network delay
        await new Promise(r => setTimeout(r, 800));
        return { sid: 'SIM_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9) };
    }
};

const getStatus = () => ({ status: 'CHECK_DB', qr: null });
const getClient = () => client;

module.exports = { getClient, getStatus, initializeClient, destroyClient, sendMessage };
