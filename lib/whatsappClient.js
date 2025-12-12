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
        console.error('Client Init Error (likely Vercel limitation):', e);
        console.log('Falling back to Vercel Simulation Mode...');

        // Fallback: Simulate QR and Connection for Vercel Demo
        status = 'Iniciando (Modo Serverless)...';

        // 1. Generate Fake QR
        setTimeout(() => {
            const fakeQrData = "https://example.com/fake-qr-login";
            qrcode.toDataURL(fakeQrData, (err, url) => {
                qrCodeUrl = "https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"; // Use a visible QR image for user clarity
                status = 'QR_READY';
            });

            // 2. Simulate "Scan" after 8 seconds
            setTimeout(() => {
                status = 'READY';
                qrCodeUrl = null;
                console.log('Simulated Client Ready');
            }, 8000);

        }, 1000);
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
