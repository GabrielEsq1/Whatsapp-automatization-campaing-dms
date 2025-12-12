import { destroyClient } from '../../../../lib/whatsappClient';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    await destroyClient();

    res.status(200).json({ success: true, message: 'Disconnected' });
}
