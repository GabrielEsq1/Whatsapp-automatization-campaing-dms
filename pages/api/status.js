import { getStatus } from '../../lib/whatsappClient';
import { getDeliveries } from './sendMessage';
import { getQueueSize } from '../../lib/queue';

export default async function handler(req, res) {
    const userId = req.query.userId;

    const waInfo = getStatus();
    const deliveries = userId ? await getDeliveries(userId) : [];
    const qinfo = getQueueSize();

    res.status(200).json({
        deliveries,
        queue: qinfo,
        status: waInfo.status,
        qr: waInfo.qr
    });
}
