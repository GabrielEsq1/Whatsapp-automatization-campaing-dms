// pages/api/auth/register.js
import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ error: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                delayMs: 1500, // Default settings
                concurrency: 1
            }
        });

        return res.status(201).json({ id: user.id, email: user.email });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
}
