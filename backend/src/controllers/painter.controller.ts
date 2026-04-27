import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../index.js';
import type { AuthRequest } from '../middleware/auth.js';

export const createJob = async (req: AuthRequest, res: Response) => {
    const customerId = req.user?.id;
    if (!customerId) return res.status(401).json({ message: 'Unauthorized' });

    const { painterId, jobType, location, scheduledDate, description, estimatedCost } = req.body;

    if (!painterId || !location || !scheduledDate) {
        return res.status(400).json({ message: 'Missing required fields: painterId, location, and scheduledDate are required.' });
    }

    try {
        // Ensure scheduledDate is a valid Date object
        const dateObj = new Date(scheduledDate);
        if (isNaN(dateObj.getTime())) {
            return res.status(400).json({ message: 'Invalid scheduledDate format' });
        }

        const job = await prisma.painterJob.create({
            data: {
                painterId,
                customerId,
                jobType: jobType || 'interior',
                location,
                description,
                scheduledDate: dateObj,
                estimatedCost: estimatedCost ? new Prisma.Decimal(estimatedCost) : 0,
                status: 'pending',
            },
        });
        res.status(201).json(job);
    } catch (error) {
        console.error('Error in createJob:', error);
        res.status(500).json({ 
            message: 'Error creating job', 
            error: error instanceof Error ? error.message : String(error) 
        });
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
            include: {
                painter: {
                    select: {
                        id: true,
                        email: true,
                        profile: true,
                    },
                },
            },
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
export const submitReview = async (req: AuthRequest, res: Response) => {
    const customerId = req.user?.id;
    if (!customerId) return res.status(401).json({ message: 'Unauthorized' });

    const { painterId, jobId, rating, comment } = req.body;

    if (!painterId || !rating) {
        return res.status(400).json({ message: 'PainterId and rating are required.' });
    }

    try {
        const customerProfile = await prisma.profile.findUnique({
            where: { userId: customerId },
        });

        const review = await prisma.painterReview.create({
            data: {
                painterId,
                customerId,
                jobId,
                rating: parseInt(rating),
                comment,
                customerName: customerProfile?.fullName || 'Anonymous Customer',
            },
        });

        // Update Job status if jobId is provided
        if (jobId) {
            await prisma.painterJob.update({
                where: { id: jobId },
                data: { status: 'reviewed' },
            });
        }

        res.status(201).json(review);
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ message: 'Error submitting review', error });
    }
};

export const getPainters = async (req: Request, res: Response) => {
    try {
        const painters = await prisma.user.findMany({
            where: { role: 'painter' },
            select: {
                id: true,
                email: true,
                profile: {
                    include: {
                        user: {
                            select: {
                                painterJobs: {
                                    include: {
                                        reviews: true
                                    }
                                }
                            }
                        }
                    }
                },
            },
        });

        // Manually calculate ratings for the response
        const formattedPainters = await Promise.all(painters.map(async (p) => {
            const reviews = await prisma.painterReview.findMany({
                where: { painterId: p.id }
            });
            
            const totalRating = reviews.reduce((acc, rev) => acc + rev.rating, 0);
            const avgRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : "0.0";

            return {
                ...p,
                profile: {
                    ...p.profile,
                    rating: avgRating,
                    reviewsCount: reviews.length
                }
            };
        }));

        res.json(formattedPainters);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching painters', error });
    }
};
