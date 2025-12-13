// pages/api/campaigns/start.js
import prisma from '../../../lib/prisma';
import { enqueue } from '../../../lib/queue';
import { generateVariation } from '../../../services/variationService';
// Switch to Meta Service (Official API)
import { sendMessage } from '../../../services/metaService';
// import { sendMessage } from '../../../lib/whatsappClient'; // Deprecated for Vercel

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const { campaignId, userId } = req.body;

    try {
        // 1. Fetch Campaign
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            include: { contacts: true }
        });

        if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
        if (campaign.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });

        // 2. Fetch User Settings
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const baseDelay = user?.delayMs || 2000;

        // 3. Mark as Processing
        await prisma.campaign.update({ where: { id: campaignId }, data: { status: 'PROCESSING' } });

        // 4. Enqueue Items
        // We iterate contacts and enqueue them one by one.
        // The queue will handle the delay.
        let enqueuedCount = 0;

        // Shuffle contacts to avoid sequential patterns if desired? No, sequential is fine with delay.

        for (const contact of campaign.contacts) {
            if (contact.status === 'SENT') continue; // Skip already sent

            // Add randomization to delay (Jitter 30%)
            const randomDelay = baseDelay + Math.floor(Math.random() * (baseDelay * 0.3));

            enqueue(async () => {
                try {
                    // Double check status before sending in case paused (not impl yet)

                    // 1. Start Conversation Flow (Bot)
                    const conversationBot = require('../../../services/conversationBot');
                    await conversationBot.startConversation(contact.id, userId, campaign.messageTemplate);

                    // 3. Log Initial Activity (optional, handled by startConversation update)
                    // We simply assume success if no error thrown
                    console.log(`Initialized conversation with ${contact.phone}`);

                    await prisma.campaignContact.update({
                        where: { id: contact.id },
                        data: { status: 'ACTIVE_CONVO', messageId: 'BOT_INIT' }
                    });

                } catch (err) {
                    console.error(`Failed to send to ${contact.phone}`, err.message);
                    await prisma.campaignContact.update({
                        where: { id: contact.id },
                        data: { status: 'FAILED' }
                    });
                    await prisma.message.create({
                        data: {
                            to: contact.phone,
                            body: campaign.messageTemplate, // log original
                            status: 'error',
                            error: err.message,
                            userId
                        }
                    });
                }
            }, randomDelay);

            enqueuedCount++;
        }

        return res.json({ ok: true, enqueued: enqueuedCount });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
}
