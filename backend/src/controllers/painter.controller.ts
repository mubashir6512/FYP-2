import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../index.js';
import type { AuthRequest } from '../middleware/auth.js';

export const createJob = async (req: AuthRequest, res: Response) => {
    const customerId = req.user?.id;
    if (!customerId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const job = await prisma.painterJob.create({
            data: {
                ...req.body,
                customerId,
            },
        });
        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ message: 'Error creating job', error });
    }
};

export const getJobs = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const role = req.user?.role;

    try {
        const where: Prisma.PainterJobWhereInput = role === 'painter'
            ? { painterId: userId as string }
            : { customerId: userId as string };

        const jobs = await prisma.painterJob.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching jobs', error });
    }
};

export const updateJobStatus = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const job = await prisma.painterJob.update({
            where: { id: id as string },
            data: { status: status as string },
        });
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: 'Error updating job status', error });
    }
};

export const getReviews = async (req: AuthRequest, res: Response) => {
    const painterId = req.user?.id;
    if (!painterId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const reviews = await prisma.painterReview.findMany({
            where: { painterId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error });
    }
};
export const getPainters = async (req: Request, res: Response) => {
    try {
        const painters = await prisma.user.findMany({
            where: { role: 'painter' },
            select: {
                id: true,
                email: true,
                profile: true,
            },
        });
        res.json(painters);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching painters', error });
    }
};
