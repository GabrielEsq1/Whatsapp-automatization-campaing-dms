// lib/whatsappClient.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

// Use global to share state between Next.js API routes and Custom Server
if (!global.whatsappClients) {
    global.whatsappClients = new Map();
}

const clients = global.whatsappClients;
let io = null;

function setIO(_io) {
    io = _io;
}

function getClient(userId) {
    return clients.get(userId);
}

// Initialize a client for a user
async function initClient(userId) {
    // If client exists...
    if (clients.has(userId)) {
        const existing = clients.get(userId);
        // If getting ready or ready, ignore
        if (existing.status === 'READY' || existing.status === 'INITIALIZING') {
            if (io && existing.status === 'READY') io.to(userId).emit('status', { status: 'READY' });
            return;
        }
    }

    console.log(`[WA] Initializing client for ${userId}`);

    // NOTE: In production/docker, you might need:
    // puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }
    const client = new Client({
        authStrategy: new LocalAuth({ clientId: userId }),
        puppeteer: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        }
    });

    // Store immediately
    clients.set(userId, { client, status: 'INITIALIZING', qr: null });

    if (io) io.to(userId).emit('status', { status: 'INITIALIZING' });

    client.on('qr', async (qr) => {
        console.log(`[WA] QR Received for ${userId}`);
        try {
            const url = await qrcode.toDataURL(qr);
            const entry = clients.get(userId);
            if (entry) {
                entry.qr = url;
                entry.status = 'QR_READY';
            }
            if (io) {
                io.to(userId).emit('qr', { src: url });
                io.to(userId).emit('status', { status: 'QR_READY' });
            }
        } catch (err) {
            console.error('[WA] QR Gen error', err);
        }
    });

    client.on('ready', () => {
        console.log(`[WA] Client ${userId} is ready!`);
        const entry = clients.get(userId);
        if (entry) {
            entry.status = 'READY';
            entry.qr = null;
        }
        if (io) io.to(userId).emit('status', { status: 'READY' });
    });

    client.on('authenticated', () => {
        console.log(`[WA] Client ${userId} authenticated`);
        if (io) io.to(userId).emit('status', { status: 'AUTHENTICATED' });
    });

    client.on('auth_failure', (msg) => {
        console.error(`[WA] Auth failure for ${userId}`, msg);
        const entry = clients.get(userId);
        if (entry) entry.status = 'AUTH_FAILURE';
        if (io) io.to(userId).emit('status', { status: 'AUTH_FAILURE' });
    });

    client.on('disconnected', (reason) => {
        console.log(`[WA] Client ${userId} disconnected: ${reason}`);
        clients.delete(userId);
        if (io) io.to(userId).emit('status', { status: 'DISCONNECTED' });
    });

    try {
        await client.initialize();
    } catch (e) {
        console.error('[WA] Init failed', e);
    }
}

async function sendMessage(userId, to, message) {
    const entry = clients.get(userId);

    // Debug log
    console.log(`[WA] Sending for ${userId}. Clients in mem: ${clients.size}`);

    if (!entry) {
        throw new Error(`WhatsApp no inicializado para este usuario. (Mem: ${clients.size})`);
    }

    if (entry.status !== 'READY') {
        throw new Error(`WhatsApp no está listo. Estado actual: ${entry.status}`);
    }

    // Format Number
    let chatId = to.replace(/\+/g, '').replace(/\s/g, '').replace(/-/g, '');

    // Basic validation (simple)
    if (chatId.length < 10) throw new Error('Número muy corto o inválido');

    if (!chatId.endsWith('@c.us')) {
        chatId += '@c.us';
    }

    try {
        const response = await entry.client.sendMessage(chatId, message);
        return { sid: response.id.id, status: 'sent' };
    } catch (e) {
        console.error('[WA] Send Message Error', e);
        throw new Error(e.message || 'Error enviando mensaje');
    }
}

async function logout(userId) {
    const entry = clients.get(userId);
    if (entry && entry.client) {
        try {
            await entry.client.destroy();
        } catch (e) { }
        clients.delete(userId);
    }
}

module.exports = {
    initClient,
    getClient,
    sendMessage,
    setIO,
    logout
};
