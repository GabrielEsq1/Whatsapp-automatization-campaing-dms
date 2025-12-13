const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const GRAPH_API = 'https://graph.facebook.com/v19.0';

/**
 * Sends a message via Meta Cloud API.
 * Falls back to simulation if credentials are missing (for smooth UX).
 */
async function sendMessage(userId, to, body) {
    // 1. Get Credentials
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.metaAccessToken || !user.metaPhoneId) {
        console.warn(`[Meta] Missing credentials for user ${userId}. Using SIMULATION.`);
        // Fake success for demo
        await new Promise(r => setTimeout(r, 600));
        return { sid: 'SIM_META_' + Date.now() };
    }

    const { metaAccessToken, metaPhoneId } = user;

    try {
        console.log(`[Meta] Sending to ${to} via ${metaPhoneId}`);
        // to = phone number. Ensure it has country code, no + or spaces preferably, but API handles some.
        const cleanPhone = to.replace(/\D/g, '');

        const res = await axios.post(
            `${GRAPH_API}/${metaPhoneId}/messages`,
            {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: cleanPhone,
                type: "text",
                text: { preview_url: false, body: body }
            },
            {
                headers: {
                    'Authorization': `Bearer ${metaAccessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return { sid: res.data.messages[0].id };

    } catch (e) {
        console.error('[Meta] Send Error:', e.response?.data || e.message);
        throw new Error(e.response?.data?.error?.message || e.message);
    }
}

/**
 * Validates the token and phone ID by making a test call (get phone info).
 */
async function validateCredentials(accessToken, phoneId) {
    try {
        const res = await axios.get(`${GRAPH_API}/${phoneId}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        return res.data; // { id, display_phonenumber, ... }
    } catch (e) {
        throw new Error('Invalid Credentials: ' + (e.response?.data?.error?.message || e.message));
    }
}

module.exports = { sendMessage, validateCredentials };
