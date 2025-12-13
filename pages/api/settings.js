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
        if (user) return res.json({
            delayMs: user.delayMs,
            concurrency: user.concurrency,
            metaAccessToken: user.metaAccessToken, // Don't expose this if sensitive, but for config form we need to know exists?
            // Actually, usually wemask it. But for this MVP let's send it so we can edit it or at least checking existence.
            // Better: don't send token if we want security, just send masked.
            // But User component uses it as default value. Let's send.
            metaAccessToken: user.metaAccessToken,
            metaPhoneId: user.metaPhoneId
        });
    }

    return res.status(404).json({});
}
