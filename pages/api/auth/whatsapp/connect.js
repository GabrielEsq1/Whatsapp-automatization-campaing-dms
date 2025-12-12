import { initializeClient } from '../../../../lib/whatsappClient';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { userId } = req.body;

    // Trigger initialization (Fire and forget in serverless, but works in Docker)
    initializeClient(userId).catch(console.error);

    res.status(200).json({ success: true, message: 'Initialization started' });
}
