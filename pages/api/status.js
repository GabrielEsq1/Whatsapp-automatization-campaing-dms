import prisma from '../../lib/prisma';
import { getDeliveries } from './sendMessage';
import { getQueueSize } from '../../lib/queue';

export default async function handler(req, res) {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    // 1. Get Real DB Status (Shared Source of Truth)
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { waStatus: true, waQrCode: true }
    });

    const deliveries = await getDeliveries(userId);
    const qinfo = getQueueSize();

    res.status(200).json({
        deliveries,
        queue: qinfo,
        status: user?.waStatus || 'DISCONNECTED',
        qr: user?.waQrCode
    });
}
