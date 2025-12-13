const { PrismaClient } = require('@prisma/client');
const { generateResponse } = require('./aiService');
// Use Meta Service
const waClient = require('./metaService');
// const waClient = require('../lib/whatsappClient');

const prisma = new PrismaClient();

// Configuration
const SYSTEM_PROMPT = `Actúa como un asistente virtual amigable y casual. Tu objetivo es iniciar una conversación natural con el usuario. NO vendas nada todavía. Solo saluda de forma empática y breve como si fueras un conocido o alguien verificando el contacto.
Evita sonar robotico. Usa español latino neutro.
Ejemplos: "Hola [Nombre], cómo vas?", "Hola!, tiempo sin hablar te escribe la IA de..." (si aplica), "Buenas, espero estés bien".
Mantén los mensajes cortos (<20 palabras).`;

const BRIDGE_PROMPT = `El usuario ha respondido. Ahora, mantén la conversación fluida. Responde a lo que dijo de forma breve y amigable. Haz una pregunta puente suave para ver si tienen interés en [TOPIC] o simplemente para calentar la relación.
Aun NO envíes la oferta completa. Solo genera confianza.`;

const PAYLOAD_PROMPT = `Ahora sí, el usuario está enganchado o ya pasaron los mensajes preliminares. Preséntales la oferta/mensaje principal: "[PAYLOAD]".
Adáptalo a la conversación previa de forma natural. Que no parezca copy-paste.
Termina invitando a la acción.`;

/**
 * Triggered by the Queue for the INITIAL CONTACT
 */
async function startConversation(contactId, userId, messageTemplate) {
    const contact = await prisma.campaignContact.findUnique({ where: { id: contactId } });
    if (!contact) return;

    // Save payload in temp storage or just reference campaign status
    // For simplicitly, we assume campaign.messageTemplate is the payload target.
    // We initiate Stage 1

    const history = [];
    const greeting = await generateResponse(history, SYSTEM_PROMPT);

    // Send via WhatsApp
    await waClient.sendMessage(userId, contact.phone, greeting);

    // Log to Dashboard
    await prisma.message.create({
        data: {
            userId,
            to: contact.phone,
            body: greeting,
            status: 'sent',
            sid: 'BOT_INIT_' + Date.now()
        }
    });

    // Update DB
    await prisma.campaignContact.update({
        where: { id: contactId },
        data: {
            conversationStage: 1,
            status: 'ACTIVE_CONVO',
            history: [{ role: 'assistant', content: greeting }],
            lastInteraction: new Date()
        }
    });
}

/**
 * Triggered by Incoming Message Listener
 */
async function handleIncomingData(userId, fromPhone, incomingBody) {
    // 1. Find active contact
    // Normalize phone (remove @c.us found in fromPhone usually)
    const phone = fromPhone.replace(/\D/g, '');

    // Find contact in an active campaign associated with this user
    // We look for contacts that are NOT 'SENT' (completed) or 'FAILED', but 'ACTIVE_CONVO' or 'PENDING'
    // Actually, we look for stage < 3
    const contact = await prisma.campaignContact.findFirst({
        where: {
            phone: { contains: phone }, // fuzzy match or robust normalization needed
            campaign: { userId: userId, status: 'PROCESSING' },
            conversationStage: { lt: 4 } // Not finished
        },
        include: { campaign: true }
    });

    if (!contact) return false; // Not a target

    console.log(`🤖 Bot Activated for ${phone} (Stage ${contact.conversationStage})`);

    // 2. Update History
    const history = contact.history || [];
    history.push({ role: 'user', content: incomingBody });

    let nextResponse = '';
    let nextStage = contact.conversationStage;

    if (contact.conversationStage === 1) {
        // We sent greeting, they replied.
        // Action: Send Bridge (Stage 2)
        nextResponse = await generateResponse(history, BRIDGE_PROMPT.replace('[TOPIC]', 'nuestros servicios'));
        nextStage = 2;

    } else if (contact.conversationStage === 2) {
        // We sent bridge, they replied.
        // Action: Send Payload (Stage 3)
        const payload = contact.campaign.messageTemplate;
        nextResponse = await generateResponse(history, PAYLOAD_PROMPT.replace('[PAYLOAD]', payload));
        nextStage = 3;
    } else {
        // Already/After Payload -> Handover
        await prisma.campaignContact.update({
            where: { id: contact.id },
            data: {
                status: 'HANDOVER',
                conversationStage: 4,
                history: history
            }
        });
        console.log(`Handing over ${phone} to human.`);
        return true;
    }

    // Send AI Response
    await waClient.sendMessage(userId, contact.phone, nextResponse);

    // 3. Log to Message Table so it appears in Dashboard
    await prisma.message.create({
        data: {
            userId: userId,
            to: contact.phone,
            body: nextResponse,
            status: 'sent',
            sid: 'BOT_ID_' + Date.now()
        }
    });

    history.push({ role: 'assistant', content: nextResponse });

    await prisma.campaignContact.update({
        where: { id: contact.id },
        data: {
            conversationStage: nextStage,
            history: history,
            lastInteraction: new Date()
        }
    });

    // If stage 3, marks as 'SENT' (completed from automation perspective)? 
    // Or keep 'handover' if user replies again. 
    if (nextStage === 3) {
        // We consider the campaign message delivered here
        await prisma.campaignContact.update({ where: { id: contact.id }, data: { status: 'SENT' } });
    }
}

return true;
}

module.exports = { startConversation, handleIncomingData };
