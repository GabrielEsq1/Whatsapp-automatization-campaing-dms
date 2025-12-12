// pages/api/sendMessage.js
import { enqueue } from '../../lib/queue';
// import { sendWhatsAppMessage } from '../../services/whatsAppService'; // REMOVED
import { generateVariation } from '../../services/variationService';
import prisma from '../../lib/prisma';
import { sendMessage } from '../../lib/whatsappClient'; // Import from local logic

// Using Custom Server, this file is executed in the same Node process if running via `node server.js`
// However, in Next.js dev mode, api routes might be isolated or HMR might break reference. 
// BUT, `require('../../lib/whatsappClient')` should point to the same cached module if using server.js custom entry.

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end('Method Not Allowed');
    }

    try {
        const { to, message, userId, context } = req.body;
        if (!to || !message || !userId) return res.status(400).json({ error: 'to, message, and userId required' });

        // Fetch user settings for delay
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const userDelay = user?.delayMs || 1500;

        // 1. Persist initial status
        const dbMsg = await prisma.message.create({
            data: {
                to,
                body: message,
                status: 'queued',
                userId
            }
        });

        // 2. Enqueue task with user's specific delay
        enqueue(async () => {
            try {
                await prisma.message.update({ where: { id: dbMsg.id }, data: { status: 'generating' } });

                const varied = await generateVariation(message, context || '');

                await prisma.message.update({ where: { id: dbMsg.id }, data: { body: varied, status: 'sending' } });

                // Use Local Client Manager
                // Note: In a real microservices architecture this would be an HTTP call to the worker service.
                // For this Monolith, we call the library directly.
                const result = await sendMessage(userId, to, varied);

                await prisma.message.update({
                    where: { id: dbMsg.id },
                    data: {
                        status: 'sent',
                        sid: result.sid
                    }
                });
            } catch (err) {
                console.error('Send error:', err);
                await prisma.message.update({
                    where: { id: dbMsg.id },
                    data: {
                        status: 'error',
                        error: err.message
                    }
                });
            }
        }, userDelay);

        return res.status(202).json({ id: dbMsg.id, status: 'queued' });
    } catch (err) {
        console.error(err);
        // If client not ready
        return res.status(500).json({ error: err.message });
    }
}

export async function getDeliveries(userId) {
    if (!userId) return [];
    return prisma.message.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50
    });
}
