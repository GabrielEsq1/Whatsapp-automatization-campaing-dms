// pages/api/campaigns/create.js
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const { name, message, numbers, userId } = req.body;
    if (!name || !message || !numbers || !userId) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    try {
        // 1. Parse numbers (comma or newline separated)
        const rawList = numbers.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
        const uniqueNumbers = [...new Set(rawList)]; // simple dedup

        if (uniqueNumbers.length === 0) return res.status(400).json({ error: 'No valid numbers found' });

        // 2. Create Campaign
        const campaign = await prisma.campaign.create({
            data: {
                name,
                messageTemplate: message,
                userId,
                status: 'DRAFT',
                contacts: {
                    create: uniqueNumbers.map(phone => ({
                        phone,
                        status: 'PENDING'
                    }))
                }
            },
            include: {
                _count: {
                    select: { contacts: true }
                }
            }
        });

        return res.status(201).json(campaign);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
}
