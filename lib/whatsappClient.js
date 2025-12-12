const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

// Global client container
let client = null;
let qrCodeUrl = null;
let status = 'DISCONNECTED';

const getClient = () => client;

const getStatus = () => ({ status, qr: qrCodeUrl });

const initializeClient = async (userId) => {
    if (client) return;

    console.log('Initializing Enterprise WhatsApp Client...');
    status = 'Iniciando...';

    // In Docker/Render, use LocalAuth.
    // In Vercel, this WILL FAIL after 10s, but the Dockerfile ensures it works on Render.
    client = new Client({
        authStrategy: new LocalAuth({ clientId: userId }),
        puppeteer: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        }
    });

    client.on('qr', (qr) => {
        console.log('QR Received');
        qrcode.toDataURL(qr, (err, url) => {
            qrCodeUrl = url;
            status = 'QR_READY';
        });
    });

    client.on('ready', () => {
        console.log('Client is ready!');
        status = 'READY';
        qrCodeUrl = null;
    });

    client.on('authenticated', () => {
        status = 'AUTHENTICATED';
    });

    client.on('disconnected', () => {
        status = 'DISCONNECTED';
        client = null;
    });

    try {
        await client.initialize();
    } catch (e) {
        console.error('Client Init Error:', e);
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

module.exports = { getClient, getStatus, initializeClient, destroyClient };
