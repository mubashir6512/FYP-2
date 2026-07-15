import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seed started...');

    // 1. Clear existing data
    await prisma.painterReview.deleteMany();
    await prisma.painterJob.deleteMany();
    await prisma.posOrderItem.deleteMany();
    await prisma.posOrder.deleteMany();
    await prisma.product.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.user.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const hashedDefaultPassword = await bcrypt.hash('123', salt);

    // 2. Create Users
    console.log('Creating users...');

    const admin = await prisma.user.create({
        data: {
            email: 'admin@paintverse.com',
            password: hashedDefaultPassword,
            role: 'admin',
            profile: {
                create: {
                    fullName: 'Platform Admin',
                }
            }
        }
    });

    const dealer = await prisma.user.create({
        data: {
            email: 'dealer@paintverse.com',
            password: hashedDefaultPassword,
            role: 'dealer',
            profile: {
                create: {
                    fullName: 'Modern Paints & Decor',
                    businessName: 'Modern Paints & Decor',
                    phone: '+92 300 1234567'
                }
            }
        }
    });

    const customer = await prisma.user.create({
        data: {
            email: 'customer@test.com',
            password: hashedDefaultPassword,
            role: 'customer',
            profile: {
                create: {
                    fullName: 'Ahmed Khan',
                    phone: '+92 321 9876543'
                }
            }
        }
    });

    const painter1 = await prisma.user.create({
        data: {
            email: 'painter@pro.com',
            password: hashedDefaultPassword,
            role: 'painter',
            profile: {
                create: {
                    fullName: 'Muhammad Asif',
                    phone: '+92 300 7654321',
                    hourlyRate: 3000,
                }
            }
        }
    });

    const painter2 = await prisma.user.create({
        data: {
            email: 'painter2@pro.com',
            password: hashedDefaultPassword,
            role: 'painter',
            profile: {
                create: {
                    fullName: 'Ali Hassan',
                    phone: '+92 321 5556677',
                    hourlyRate: 3200,
                }
            }
        }
    });

    const painter3 = await prisma.user.create({
        data: {
            email: 'painter3@pro.com',
            password: hashedDefaultPassword,
            role: 'painter',
            profile: {
                create: {
                    fullName: 'Fatima Malik',
                    phone: '+92 333 4445566',
                    hourlyRate: 2800,
                }
            }
        }
    });

    const painter4 = await prisma.user.create({
        data: {
            email: 'painter4@pro.com',
            password: hashedDefaultPassword,
            role: 'painter',
            profile: {
                create: {
                    fullName: 'Usman Ahmed',
                    phone: '+92 345 8889900',
                    hourlyRate: 3500,
                }
            }
        }
    });

    const painter5 = await prisma.user.create({
        data: {
            email: 'painter5@pro.com',
            password: hashedDefaultPassword,
            role: 'painter',
            profile: {
                create: {
                    fullName: 'Ayesha Siddiqui',
                    phone: '+92 301 2223344',
                    hourlyRate: 3000,
                }
            }
        }
    });

    // 3. Create Products for Dealer
    console.log('Creating products...');

    const productsData = [
        {
            name: 'Ocean Breeze Matte',
            brand: 'ColorMaster Pro',
            category: 'interior',
            colorHex: '#1e90ff',
            price: 3500,
            stockQuantity: 150,
            sku: 'CMP-OBM-001',
            description: 'Cool blue matte finish for calming interiors.'
        },
        {
            name: 'Sunlight Yellow Eggshell',
            brand: 'ColorMaster Pro',
            category: 'interior',
            colorHex: '#ffd700',
            price: 3200,
            stockQuantity: 45,
            sku: 'CMP-SYE-002',
            description: 'Bright and energetic yellow with a subtle sheen.'
        },
        {
            name: 'Forest Green Gloss',
            brand: 'EcoCoat',
            category: 'exterior',
            colorHex: '#228b22',
            price: 4800,
            stockQuantity: 80,
            sku: 'ECO-FGG-003',
            description: 'Durable exterior gloss for long-lasting protection.'
        },
        {
            name: 'Royal Purple Satin',
            brand: 'LuxuryDecor',
            category: 'interior',
            colorHex: '#800080',
            price: 6500,
            stockQuantity: 25,
            sku: 'LUX-RPS-004',
            description: 'Elegant satin finish for feature walls.'
        },
        {
            name: 'Crimson Red Gloss',
            brand: 'ColorMaster Pro',
            category: 'interior',
            colorHex: '#dc143c',
            price: 3800,
            stockQuantity: 95,
            sku: 'CMP-CRG-005',
            description: 'Bold crimson red with high-gloss finish for statement walls.'
        },
        {
            name: 'Soft Cream Matte',
            brand: 'EcoCoat',
            category: 'interior',
            colorHex: '#fffdd0',
            price: 2800,
            stockQuantity: 200,
            sku: 'ECO-SCM-006',
            description: 'Warm cream color perfect for living rooms and bedrooms.'
        },
        {
            name: 'Charcoal Grey Satin',
            brand: 'LuxuryDecor',
            category: 'interior',
            colorHex: '#36454f',
            price: 4200,
            stockQuantity: 120,
            sku: 'LUX-CGS-007',
            description: 'Modern charcoal grey with sophisticated satin finish.'
        },
        {
            name: 'Mint Green Eggshell',
            brand: 'ColorMaster Pro',
            category: 'interior',
            colorHex: '#98ff98',
            price: 3300,
            stockQuantity: 8,
            sku: 'CMP-MGE-008',
            description: 'Fresh mint green for kitchens and bathrooms.'
        },
        {
            name: 'Terracotta Orange Matte',
            brand: 'EcoCoat',
            category: 'exterior',
            colorHex: '#e2725b',
            price: 4500,
            stockQuantity: 65,
            sku: 'ECO-TOM-009',
            description: 'Warm terracotta for Mediterranean-style exteriors.'
        },
        {
            name: 'Navy Blue Gloss',
            brand: 'LuxuryDecor',
            category: 'interior',
            colorHex: '#000080',
            price: 4400,
            stockQuantity: 75,
            sku: 'LUX-NBG-010',
            description: 'Deep navy blue with premium gloss finish.'
        },
        {
            name: 'Peach Blush Satin',
            brand: 'ColorMaster Pro',
            category: 'interior',
            colorHex: '#ffdab9',
            price: 3400,
            stockQuantity: 110,
            sku: 'CMP-PBS-011',
            description: 'Soft peach tone perfect for nurseries and bedrooms.'
        },
        {
            name: 'Slate Grey Matte',
            brand: 'EcoCoat',
            category: 'exterior',
            colorHex: '#708090',
            price: 4700,
            stockQuantity: 90,
            sku: 'ECO-SGM-012',
            description: 'Contemporary slate grey for modern exteriors.'
        },
        {
            name: 'Lavender Purple Eggshell',
            brand: 'LuxuryDecor',
            category: 'interior',
            colorHex: '#e6e6fa',
            price: 3700,
            stockQuantity: 5,
            sku: 'LUX-LPE-013',
            description: 'Delicate lavender for relaxing spaces.'
        },
        {
            name: 'Coral Pink Satin',
            brand: 'ColorMaster Pro',
            category: 'interior',
            colorHex: '#ff7f50',
            price: 3500,
            stockQuantity: 85,
            sku: 'CMP-CPS-014',
            description: 'Vibrant coral pink for accent walls.'
        },
        {
            name: 'Olive Green Matte',
            brand: 'EcoCoat',
            category: 'interior',
            colorHex: '#808000',
            price: 3900,
            stockQuantity: 100,
            sku: 'ECO-OGM-015',
            description: 'Earthy olive green for natural aesthetics.'
        },
        {
            name: 'Pure White Gloss',
            brand: 'ColorMaster Pro',
            category: 'interior',
            colorHex: '#ffffff',
            price: 2700,
            stockQuantity: 250,
            sku: 'CMP-PWG-016',
            description: 'Classic pure white with brilliant gloss finish.'
        },
        {
            name: 'Burgundy Red Satin',
            brand: 'LuxuryDecor',
            category: 'interior',
            colorHex: '#800020',
            price: 4600,
            stockQuantity: 60,
            sku: 'LUX-BRS-017',
            description: 'Rich burgundy for elegant dining rooms.'
        },
        {
            name: 'Sky Blue Matte',
            brand: 'EcoCoat',
            category: 'interior',
            colorHex: '#87ceeb',
            price: 3200,
            stockQuantity: 130,
            sku: 'ECO-SBM-018',
            description: 'Light sky blue for airy, open spaces.'
        },
        {
            name: 'Beige Sand Eggshell',
            brand: 'ColorMaster Pro',
            category: 'interior',
            colorHex: '#f5f5dc',
            price: 3000,
            stockQuantity: 180,
            sku: 'CMP-BSE-019',
            description: 'Neutral beige perfect for any room.'
        },
        {
            name: 'Teal Blue Gloss',
            brand: 'LuxuryDecor',
            category: 'interior',
            colorHex: '#008080',
            price: 4300,
            stockQuantity: 70,
            sku: 'LUX-TBG-020',
            description: 'Sophisticated teal with high-gloss finish.'
        }
    ];

    for (const p of productsData) {
        await prisma.product.create({
            data: {
                ...p,
                dealerId: dealer.id,
            }
        });
    }

    const createdProducts = await prisma.product.findMany();

    // 4. Create Painter Jobs
    console.log('Creating painter jobs...');

    // Painter 1 jobs
    await prisma.painterJob.create({
        data: {
            painterId: painter1.id,
            customerId: customer.id,
            customerName: 'Ahmed Khan',
            location: 'DHA Phase 5, Karachi',
            jobType: 'interior',
            description: 'Living room and 2 bedrooms painting.',
            estimatedHours: 48,
            estimatedCost: 65000,
            status: 'completed',
        }
    });

    await prisma.painterJob.create({
        data: {
            painterId: painter1.id,
            customerId: customer.id,
            customerName: 'Ahmed Khan',
            location: 'Clifton, Karachi',
            jobType: 'exterior',
            description: 'Garden wall painting.',
            estimatedHours: 12,
            estimatedCost: 22000,
            status: 'in-progress',
        }
    });

    await prisma.painterJob.create({
        data: {
            painterId: painter1.id,
            customerId: customer.id,
            customerName: 'Sarah Malik',
            customerPhone: '+92 333 1112233',
            location: 'Gulshan-e-Iqbal, Karachi',
            jobType: 'interior',
            description: 'Complete apartment repainting - 3BHK.',
            estimatedHours: 72,
            estimatedCost: 120000,
            status: 'pending',
        }
    });

    // Painter 2 jobs
    await prisma.painterJob.create({
        data: {
            painterId: painter2.id,
            customerId: customer.id,
            customerName: 'Bilal Ahmed',
            customerPhone: '+92 321 4445566',
            location: 'Bahria Town, Lahore',
            jobType: 'interior',
            description: 'Kitchen and dining area painting.',
            estimatedHours: 24,
            estimatedCost: 40000,
            status: 'accepted',
        }
    });

    await prisma.painterJob.create({
        data: {
            painterId: painter2.id,
            customerId: customer.id,
            customerName: 'Zainab Hassan',
            customerPhone: '+92 300 7778899',
            location: 'Model Town, Lahore',
            jobType: 'exterior',
            description: 'Building facade painting.',
            estimatedHours: 96,
            estimatedCost: 200000,
            status: 'completed',
        }
    });

    // Painter 3 jobs
    await prisma.painterJob.create({
        data: {
            painterId: painter3.id,
            customerId: customer.id,
            customerName: 'Hamza Raza',
            customerPhone: '+92 345 2223344',
            location: 'F-7, Islamabad',
            jobType: 'interior',
            description: 'Office space painting - 2000 sq ft.',
            estimatedHours: 60,
            estimatedCost: 145000,
            status: 'pending',
        }
    });

    await prisma.painterJob.create({
        data: {
            painterId: painter3.id,
            customerId: customer.id,
            customerName: 'Mariam Khan',
            location: 'G-11, Islamabad',
            jobType: 'interior',
            description: 'Master bedroom and bathroom.',
            estimatedHours: 20,
            estimatedCost: 32000,
            status: 'accepted',
        }
    });

    // Painter 4 jobs
    await prisma.painterJob.create({
        data: {
            painterId: painter4.id,
            customerId: customer.id,
            customerName: 'Imran Siddiqui',
            customerPhone: '+92 333 5556677',
            location: 'Johar Town, Lahore',
            jobType: 'exterior',
            description: 'Villa exterior complete painting.',
            estimatedHours: 120,
            estimatedCost: 250000,
            status: 'pending',
        }
    });

    await prisma.painterJob.create({
        data: {
            painterId: painter4.id,
            customerId: customer.id,
            customerName: 'Sana Tariq',
            location: 'Gulberg, Lahore',
            jobType: 'interior',
            description: 'Kids room with custom designs.',
            estimatedHours: 16,
            estimatedCost: 48000,
            status: 'completed',
        }
    });

    // Painter 5 jobs
    await prisma.painterJob.create({
        data: {
            painterId: painter5.id,
            customerId: customer.id,
            customerName: 'Faisal Mahmood',
            customerPhone: '+92 301 8889900',
            location: 'North Nazimabad, Karachi',
            jobType: 'interior',
            description: 'Living room accent wall.',
            estimatedHours: 8,
            estimatedCost: 16000,
            status: 'pending',
        }
    });

    await prisma.painterJob.create({
        data: {
            painterId: painter5.id,
            customerId: customer.id,
            customerName: 'Hira Saleem',
            location: 'Saddar, Karachi',
            jobType: 'interior',
            description: 'Complete 2BHK apartment.',
            estimatedHours: 48,
            estimatedCost: 85000,
            status: 'accepted',
        }
    });

    // 5. Create Reviews
    console.log('Creating reviews...');

    // Reviews for Painter 1
    await prisma.painterReview.create({
        data: {
            painterId: painter1.id,
            customerId: customer.id,
            customerName: 'Ahmed Khan',
            rating: 5,
            comment: 'Excellent work! Very professional and clean.',
        }
    });

    await prisma.painterReview.create({
        data: {
            painterId: painter1.id,
            customerId: customer.id,
            customerName: 'Sarah Malik',
            rating: 5,
            comment: 'Muhammad Asif did an amazing job. Highly recommend!',
        }
    });

    await prisma.painterReview.create({
        data: {
            painterId: painter1.id,
            customerId: customer.id,
            customerName: 'Bilal Ahmed',
            rating: 4,
            comment: 'Good quality work, completed on time.',
        }
    });

    // Reviews for Painter 2
    await prisma.painterReview.create({
        data: {
            painterId: painter2.id,
            customerId: customer.id,
            customerName: 'Zainab Hassan',
            rating: 5,
            comment: 'Ali is very skilled and detail-oriented. Perfect finish!',
        }
    });

    await prisma.painterReview.create({
        data: {
            painterId: painter2.id,
            customerId: customer.id,
            customerName: 'Hamza Raza',
            rating: 5,
            comment: 'Professional service, great communication.',
        }
    });

    // Reviews for Painter 3
    await prisma.painterReview.create({
        data: {
            painterId: painter3.id,
            customerId: customer.id,
            customerName: 'Mariam Khan',
            rating: 5,
            comment: 'Fatima was fantastic! Very neat and efficient.',
        }
    });

    await prisma.painterReview.create({
        data: {
            painterId: painter3.id,
            customerId: customer.id,
            customerName: 'Imran Siddiqui',
            rating: 4,
            comment: 'Great work, would hire again.',
        }
    });

    // Reviews for Painter 4
    await prisma.painterReview.create({
        data: {
            painterId: painter4.id,
            customerId: customer.id,
            customerName: 'Sana Tariq',
            rating: 5,
            comment: 'Usman exceeded expectations. Beautiful custom designs!',
        }
    });

    await prisma.painterReview.create({
        data: {
            painterId: painter4.id,
            customerId: customer.id,
            customerName: 'Faisal Mahmood',
            rating: 5,
            comment: 'Very professional and punctual.',
        }
    });

    // Reviews for Painter 5
    await prisma.painterReview.create({
        data: {
            painterId: painter5.id,
            customerId: customer.id,
            customerName: 'Hira Saleem',
            rating: 5,
            comment: 'Ayesha is amazing! Perfect color matching and smooth finish.',
        }
    });

    await prisma.painterReview.create({
        data: {
            painterId: painter5.id,
            customerId: customer.id,
            customerName: 'Ahmed Khan',
            rating: 4,
            comment: 'Good service, reasonable pricing.',
        }
    });

    // 6. Create POS Orders for Dealer
    console.log('Creating POS orders...');

    await prisma.posOrder.create({
        data: {
            dealerId: dealer.id,
            customerName: 'Walk-in Customer',
            orderNumber: 'ORD-' + Math.floor(Math.random() * 1000000),
            total: 3600,
            paymentMethod: 'cash',
            status: 'completed',
            items: {
                create: [
                    {
                        productId: createdProducts[0]!.id,
                        productName: createdProducts[0]!.name,
                        quantity: 2,
                        unitPrice: createdProducts[0]!.price,
                        totalPrice: Number(createdProducts[0]!.price) * 2,
                    },
                    {
                        productId: createdProducts[1]!.id,
                        productName: createdProducts[1]!.name,
                        quantity: 1,
                        unitPrice: createdProducts[1]!.price,
                        totalPrice: Number(createdProducts[1]!.price),
                    }
                ]
            }
        }
    });

    console.log('✅ Seed completed successfully!');
    console.log('');
    console.log('Test Accounts (password: 123):');
    console.log('- Admin: admin@paintverse.com');
    console.log('- Dealer: dealer@paintverse.com');
    console.log('- Customer: customer@test.com');
    console.log('- Painter 1: painter@pro.com (Muhammad Asif)');
    console.log('- Painter 2: painter2@pro.com (Ali Hassan)');
    console.log('- Painter 3: painter3@pro.com (Fatima Malik)');
    console.log('- Painter 4: painter4@pro.com (Usman Ahmed)');
    console.log('- Painter 5: painter5@pro.com (Ayesha Siddiqui)');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
