// services/whatsAppService.js
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_WHATSAPP_NUMBER; // e.g. whatsapp:+1415XXXX
let client = null;

if (accountSid && authToken) client = twilio(accountSid, authToken);

export async function sendWhatsAppMessage(to, body) {
    if (!client) throw new Error('Twilio not configured');
    if (!to || !body) throw new Error('Missing to or body');

    const toFormatted = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const fromFormatted = from.startsWith('whatsapp:') ? from : `whatsapp:${from}`;

    const res = await client.messages.create({
        body,
        from: fromFormatted,
        to: toFormatted,
    });

    return {
        sid: res.sid,
        status: res.status,
        to: res.to,
        body: res.body
    };
}
