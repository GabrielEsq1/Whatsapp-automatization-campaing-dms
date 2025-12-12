// pages/api/control.js
import { pauseQueue, resumeQueue, getQueueSize } from '../../lib/queue';

export default function handler(req, res) {
    if (req.method === 'POST') {
        const { action } = req.body;
        if (action === 'pause') {
            pauseQueue();
            return res.status(200).json({ ok: true, action: 'paused' });
        } else if (action === 'resume') {
            resumeQueue();
            return res.status(200).json({ ok: true, action: 'resumed' });
        } else {
            return res.status(400).json({ error: 'unknown action' });
        }
    }

    if (req.method === 'GET') {
        return res.status(200).json(getQueueSize());
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end('Method Not Allowed');
}
