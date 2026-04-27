import type { Response } from 'express';
import { prisma } from '../index.js';
import type { AuthRequest } from '../middleware/auth.js';

export const getSettings = async (req: AuthRequest, res: Response) => {
    try {
        const settings = await prisma.systemSetting.findMany();
        // Convert array of {key, value} to an object
        const settingsObj = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, any>);
        
        res.json(settingsObj);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching system settings', error });
    }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
    const newSettings = req.body; // Expecting an object { key: value, ... }

    try {
        const updatePromises = Object.entries(newSettings).map(([key, value]) => {
            return prisma.systemSetting.upsert({
                where: { key },
                update: { value: value as any },
                create: { key, value: value as any },
            });
        });

        await Promise.all(updatePromises);
        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating system settings', error });
    }
};
