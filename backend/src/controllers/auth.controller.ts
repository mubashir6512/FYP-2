import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../index.js';
import { generateToken } from '../utils/jwt.js';

export const register = async (req: Request, res: Response) => {
    const { email, password, fullName, role } = req.body;

    try {
        const existingUser = await prisma.user.findUnique({ where: { email: email as string } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: role || 'customer',
                profile: {
                    create: {
                        fullName: fullName || '',
                    },
                },
            },
            include: { profile: true },
        });

        const token = generateToken({ id: user.id, role: user.role });
        res.status(201).json({ user, token });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email: email as string },
            include: { profile: true },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = generateToken({ id: user.id, role: user.role });
        res.json({ user, token });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
