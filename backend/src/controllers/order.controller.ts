import type { Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../index.js';
import type { AuthRequest } from '../middleware/auth.js';

export const createOrder = async (req: AuthRequest, res: Response) => {
    const dealerId = req.user?.id;
    if (!dealerId) return res.status(401).json({ message: 'Unauthorized' });

    const { items, ...orderData } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Order must have at least one item' });
    }

    try {
        const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // 1. Generate Order Number (ORD-YYYYMMDD-XXXX)
            const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            const orderNumber = `ORD-${date}-${random}`;

            // 2. Validate stock and reduce it for each product
            for (const item of items) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                    select: { stockQuantity: true, name: true }
                });

                if (!product) {
                    throw new Error(`Product ${item.productName} not found`);
                }

                if (product.stockQuantity < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stockQuantity}, Requested: ${item.quantity}`);
                }

                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stockQuantity: {
                            decrement: item.quantity,
                        },
                    },
                });
            }

            // 3. Create the order
            const newOrder = await tx.posOrder.create({
                data: {
                    ...orderData,
                    orderNumber,
                    dealerId,
                    items: {
                        create: items.map((item: any) => ({
                            productId: item.productId,
                            productName: item.productName,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            totalPrice: item.totalPrice,
                        })),
                    },
                },
                include: { items: true },
            });

            return newOrder;
        });

        res.status(201).json(order);
    } catch (error: any) {
        console.error('POS Order Error:', error);
        res.status(400).json({ message: error.message || 'Error creating order' });
    }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const role = req.user?.role;

    try {
        let where: Prisma.PosOrderWhereInput = {};

        if (role === 'admin') {
            where = {};
        } else if (role === 'dealer') {
            where = { dealerId: userId as string };
        } else if (role === 'customer') {
            // Fetch user's profile to get phone number
            const profile = await prisma.profile.findUnique({
                where: { userId: userId as string },
                select: { phone: true }
            });

            where = {
                OR: [
                    { customerId: userId as string },
                    ...(profile?.phone ? [{ customerPhone: profile.phone }] : [])
                ]
            };
        }

        const orders = await prisma.posOrder.findMany({
            where,
            include: { items: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json(orders);
    } catch (error) {
        console.error('Fetch Orders Error:', error);
        res.status(500).json({ message: 'Error fetching orders', error });
    }
};
