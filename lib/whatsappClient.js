const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
let chromium;
let puppeteer;

// Global client container
let client = null;
let qrCodeUrl = null;
let status = 'DISCONNECTED';

const getClient = () => client;

const getStatus = () => ({ status, qr: qrCodeUrl });

const initializeClient = async (userId) => {
    if (client) return;

    try {
        console.log('Initializing Real WhatsApp Client (Vercel Mode)...');
        status = 'Iniciando Browser...';

        // Dynamic import for Vercel environment
        if (process.env.AWS_LAMBDA_FUNCTION_VERSION || process.env.VERCEL) {
            chromium = require('@sparticuz/chromium');
            puppeteer = require('puppeteer-core');
        } else {
            // Local fallback
            try {
                puppeteer = require('puppeteer');
            } catch (e) { }
        }

        let browserOptions = {};

        if (process.env.AWS_LAMBDA_FUNCTION_VERSION || process.env.VERCEL) {
            // Vercel / Lambda Config
            browserOptions = {
                args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
                ignoreHTTPSErrors: true,
            };
        } else {
            // Local / Docker Config
            browserOptions = {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            };
        }

        client = new Client({
            authStrategy: new LocalAuth({ clientId: userId }),
            puppeteer: browserOptions
        });

        client.on('qr', (qr) => {
            console.log('Real QR Received');
            qrcode.toDataURL(qr, (err, url) => {
                qrCodeUrl = url;
                status = 'QR_READY';
            });
        });

        client.on('ready', () => {
            console.log('Real Client is ready!');
            status = 'READY';
            qrCodeUrl = null;
        });

        client.on('authenticated', () => {
            status = 'AUTHENTICATED';
        });

        client.on('disconnected', (reason) => {
            console.log('Client Disconnected', reason);
            status = 'DISCONNECTED';
            client = null;
        });

        await client.initialize();

    } catch (e) {
        console.error('Fatal Client Init Error:', e);
        status = 'ERROR';
    }
};

const destroyClient = async () => {
    if (client) {
        await client.destroy();
        client = null;
        status = 'DISCONNECTED';
    }
};

const sendMessage = async (userId, to, message) => {
    // 1. Check readiness
    if (status !== 'READY' || !client) {
        throw new Error('WhatsApp client not ready. Scan REAL QR first.');
    }

    // 2. Format Number
    let chatId = to.includes('@c.us') ? to : `${to}@c.us`;
    if (!to.includes('@')) chatId = `${to.replace(/\D/g, '')}@c.us`;

    // 3. Real Send
    try {
        console.log(`sending to ${chatId}`);
        const msg = await client.sendMessage(chatId, message);
        return { sid: msg.id.id };
    } catch (e) {
        console.error('Real Send Failed:', e);
        throw e;
    }
};

module.exports = { getClient, getStatus, initializeClient, destroyClient, sendMessage };
