import { generateVariation } from '../../../services/variationService';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    try {
        const variation = await generateVariation(message);
        res.json({ variation });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
}
