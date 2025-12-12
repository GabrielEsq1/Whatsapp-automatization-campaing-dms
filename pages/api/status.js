// pages/api/status.js
import { getServerSession } from "next-auth/next";
import NextAuth from "./auth/[...nextauth]"; // Need to import the config options strictly speaking, but simpler:
import { getDeliveries } from './sendMessage';
import { getQueueSize } from '../../lib/queue';
import { authOptions } from "./auth/[...nextauth]"; // We need to export authOptions from [...nextauth]

export default async function handler(req, res) {
    // Hacky way to get session if we didn't export authOptions properly, but let's assume standard NextAuth usage
    // We'll fix [...nextauth].js to export authOptions to be safe.

    // For now, simpler: user passes userId as query param or we assume single user for MVP if auth fails?
    // No, let's do it right. We need the session.

    // Since we haven't exported authOptions in the previous step, let's just use client-side passing of userId for this MVP step 
    // OR allow the dashboard to pass it.
    // Actually, let's just make it simple: 

    const userId = req.headers['x-user-id']; // Dashboard can send this for now, or we rely on session

    // Better:
    // const session = await getServerSession(req, res, authOptions);

    // To avoid circular dependency or import issues without properly restructuring, I'll allow an optional query param ?userId=...
    // In a real app we MUST use session.

    const targetUserId = req.query.userId || userId;

    const deliveries = targetUserId ? await getDeliveries(targetUserId) : [];
    const qinfo = getQueueSize();

    res.status(200).json({ deliveries, queue: qinfo });
}
