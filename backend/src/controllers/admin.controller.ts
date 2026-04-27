import type { Response } from 'express';
import { prisma } from '../index.js';
import type { AuthRequest } from '../middleware/auth.js';

// ─── Users ─────────────────────────────────────────────────────────────────

export const getAllUsers = async (req: AuthRequest, res: Response) => {
    try {
        const { role, search } = req.query;
        const where: any = {};
        if (role && role !== 'all') where.role = role;
        if (search) {
            where.OR = [
                { email: { contains: search as string, mode: 'insensitive' } },
                { profile: { fullName: { contains: search as string, mode: 'insensitive' } } },
            ];
        }
        const users = await prisma.user.findMany({
            where,
            include: { profile: true },
            orderBy: { createdAt: 'desc' },
        });
        // strip passwords
        const safe = users.map(({ password, ...u }) => u);
        res.json(safe);
    } catch (error) {
        console.error('Admin getAllUsers error:', error);
        res.status(500).json({ message: 'Error fetching users', error });
    }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            include: { profile: true },
        });
        if (!user) return res.status(404).json({ message: 'User not found' });
        const { password, ...safe } = user;
        res.json(safe);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error });
    }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    try {
        await prisma.user.delete({ where: { id } });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error });
    }
};

// ─── Dealers ────────────────────────────────────────────────────────────────

export const getAllDealers = async (req: AuthRequest, res: Response) => {
    try {
        const dealers = await prisma.user.findMany({
            where: { role: 'dealer' },
            include: {
                profile: true,
                products: { select: { id: true, price: true, stockQuantity: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        const result = dealers.map(({ password, products, ...dealer }) => ({
            ...dealer,
            productCount: products.length,
            totalInventoryValue: products.reduce(
                (sum, p) => sum + Number(p.price) * p.stockQuantity, 0
            ),
        }));
        res.json(result);
    } catch (error) {
        console.error('Admin getAllDealers error:', error);
        res.status(500).json({ message: 'Error fetching dealers', error });
    }
};

export const getDealerById = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    try {
        const dealer = await prisma.user.findUnique({
            where: { id, role: 'dealer' },
            include: { profile: true, products: true },
        });
        if (!dealer) return res.status(404).json({ message: 'Dealer not found' });
        const orders = await prisma.posOrder.findMany({
            where: { dealerId: id },
            include: { items: true },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        const { password, ...safe } = dealer;
        res.json({ ...safe, orders });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dealer', error });
    }
};

// ─── Painters ───────────────────────────────────────────────────────────────

export const getAllPainters = async (req: AuthRequest, res: Response) => {
    try {
        const painters = await prisma.user.findMany({
            where: { role: 'painter' },
            include: { profile: true },
            orderBy: { createdAt: 'desc' },
        });

        const result = await Promise.all(
            painters.map(async ({ password, ...painter }) => {
                const [jobs, reviews] = await Promise.all([
                    prisma.painterJob.findMany({ where: { painterId: painter.id } }),
                    prisma.painterReview.findMany({ where: { painterId: painter.id } }),
                ]);
                const avgRating = reviews.length
                    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
                    : 0;
                return {
                    ...painter,
                    totalJobs: jobs.length,
                    completedJobs: jobs.filter(j => j.status === 'completed').length,
                    avgRating: Number(avgRating.toFixed(1)),
                    reviewCount: reviews.length,
                };
            })
        );
        res.json(result);
    } catch (error) {
        console.error('Admin getAllPainters error:', error);
        res.status(500).json({ message: 'Error fetching painters', error });
    }
};

export const getPainterById = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    try {
        const painter = await prisma.user.findUnique({
            where: { id, role: 'painter' },
            include: { profile: true },
        });
        if (!painter) return res.status(404).json({ message: 'Painter not found' });
        const [jobs, reviews] = await Promise.all([
            prisma.painterJob.findMany({
                where: { painterId: id },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.painterReview.findMany({
                where: { painterId: id },
                orderBy: { createdAt: 'desc' },
            }),
        ]);
        const { password, ...safe } = painter;
        res.json({ ...safe, jobs, reviews });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching painter', error });
    }
};

// ─── Reports ────────────────────────────────────────────────────────────────

export const getReportsSummary = async (req: AuthRequest, res: Response) => {
    try {
        const [totalUsers, totalOrders, totalProducts, totalPainters] = await Promise.all([
            prisma.user.count(),
            prisma.posOrder.count(),
            prisma.product.count(),
            prisma.user.count({ where: { role: 'painter' } }),
        ]);

        const orders = await prisma.posOrder.findMany({ include: { items: true } });
        const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);

        // Monthly breakdown (last 6 months)
        const monthly: Record<string, { revenue: number; orders: number }> = {};
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
            monthly[key] = { revenue: 0, orders: 0 };
        }
        orders.forEach(o => {
            const d = new Date(o.createdAt);
            const diffMonths =
                (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
            if (diffMonths < 6) {
                const key = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
                if (monthly[key]) {
                    monthly[key].revenue += Number(o.total);
                    monthly[key].orders += 1;
                }
            }
        });

        // Top products
        const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                if (!productSales[item.productName]) {
                    productSales[item.productName] = { name: item.productName, quantity: 0, revenue: 0 };
                }
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                productSales[item.productName]!.quantity += item.quantity;
                productSales[item.productName]!.revenue += Number(item.totalPrice);
            });
        });
        const topProducts = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);

        // User growth (last 6 months)
        const allUsers = await prisma.user.findMany({ select: { createdAt: true, role: true } });
        const userGrowth: Record<string, number> = {};
        Object.keys(monthly).forEach(k => (userGrowth[k] = 0));
        allUsers.forEach(u => {
            const d = new Date(u.createdAt);
            const diffMonths =
                (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
            if (diffMonths < 6) {
                const key = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
                if (userGrowth[key] !== undefined) userGrowth[key] += 1;
            }
        });

        res.json({
            totals: { totalUsers, totalOrders, totalProducts, totalPainters, totalRevenue },
            monthly: Object.entries(monthly).map(([month, data]) => ({ month, ...data })),
            topProducts,
            userGrowth: Object.entries(userGrowth).map(([month, newUsers]) => ({ month, newUsers })),
        });
    } catch (error) {
        console.error('Admin getReportsSummary error:', error);
        res.status(500).json({ message: 'Error generating report', error });
    }
};
