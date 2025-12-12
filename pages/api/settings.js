// pages/api/settings.js
import prisma from '../../lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { userId, delayMs, concurrency } = req.body;
        if (!userId) return res.status(400).json({ error: 'User ID required' });

        try {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    delayMs: parseInt(delayMs),
                    concurrency: parseInt(concurrency)
                }
            });
            return res.json({ ok: true });
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }

    // GET
    const { userId } = req.query;
    if (userId) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user) return res.json({ delayMs: user.delayMs, concurrency: user.concurrency });
    }

    return res.status(404).json({});
}
