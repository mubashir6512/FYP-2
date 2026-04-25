import type { Request, Response } from 'express';
import { prisma } from '../index.js';
import type { AuthRequest } from '../middleware/auth.js';

export const getProducts = async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany({
            where: { isActive: true },
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error });
    }
};

export const getDealerProducts = async (req: AuthRequest, res: Response) => {
    const dealerId = req.user?.id;
    if (!dealerId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const products = await prisma.product.findMany({
            where: { dealerId },
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dealer products', error });
    }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
    const dealerId = req.user?.id;
    if (!dealerId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const product = await prisma.product.create({
            data: {
                ...req.body,
                dealerId,
            },
        });
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error creating product', error });
    }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const dealerId = req.user?.id;
    if (!dealerId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const product = await prisma.product.update({
            where: { id: id as string, dealerId: dealerId as string },
            data: req.body,
        });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error });
    }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const dealerId = req.user?.id;
    if (!dealerId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        await prisma.product.delete({
            where: { id: id as string, dealerId: dealerId as string },
        });
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error });
    }
};
