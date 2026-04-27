import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../index.js';
import { generateToken } from '../utils/jwt.js';

export const register = async (req: Request, res: Response) => {
    const { email, password, fullName, role } = req.body;
    console.log('Registration attempt for:', email);

    try {
        const existingUser = await prisma.user.findUnique({ where: { email: email as string } });
        if (existingUser) {
            console.log('Registration failed: User already exists');
            return res.status(400).json({ message: 'User already exists' });
        }

        console.log('Hashing password...');
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log('Creating user in DB...');
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: role || 'customer',
                profile: {
                    create: {
                        fullName: fullName || '',
                        businessName: role === 'dealer' ? (fullName || '') : null,
                    },
                },
            },
            include: { profile: true },
        });

        console.log('User created successfully:', user.id);
        console.log('Generating token...');
        const token = generateToken({ id: user.id, role: user.role });

        console.log('Registration complete, sending response');
        res.status(201).json({ user, token });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({
            message: 'Server error during registration',
            error: error instanceof Error ? error.message : error
        });
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

export const getMe = async (req: any, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: { profile: true },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
export const updateProfile = async (req: any, res: Response) => {
    const {
        fullName, phone, avatarUrl, bio, businessName,
        address, city, notifications, specialization,
        experience, hourlyRate, skills, availability
    } = req.body;

    try {
        const profile = await prisma.profile.update({
            where: { userId: req.user.id },
            data: {
                fullName,
                phone,
                avatarUrl,
                bio,
                businessName,
                address,
                city,
                specialization,
                experience: (experience !== undefined && experience !== null && experience !== "") ? parseInt(experience.toString()) : null,
                hourlyRate: (hourlyRate !== undefined && hourlyRate !== null && hourlyRate !== "") ? parseFloat(hourlyRate.toString()) : null,
                skills,
                availability,
                notifications: notifications as any,
            },
        });

        res.json({ message: 'Profile updated successfully', profile });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error });
    }
};
