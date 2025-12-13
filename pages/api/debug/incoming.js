import { handleIncomingData } from '../../../../services/conversationBot';

/**
 * Debug Endpoint to simulate receiving a WhatsApp Message
 * Usage: POST /api/debug/incoming { from: "123456", body: "Hola" }
 */
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const { userId, from, body } = req.body; // userId needed to know which bot instance/DB to target

    console.log(`[DEBUG] Simulating Incoming Msg from ${from}: ${body}`);

    try {
        const handled = await handleIncomingData(userId, from, body);
        res.json({ success: true, handled });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
}
