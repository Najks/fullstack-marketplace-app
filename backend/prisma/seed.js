// javascript
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Web-facing URLs for images; make sure your server serves `backend/uploads` at `/uploads`
const uploadImages = Array.from({ length: 10 }, (_, i) => `/uploads/used${i + 1}.webp`);

async function seedCore() {
    // statuses
    for (const name of ['active', 'sold']) {
        await prisma.productStatus.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }

    // categories
    for (const name of ['electronics', 'computers']) {
        await prisma.category.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }
}

async function seedUserNik() {
    const data = {
        email: 'nik.damis@gmail.com',
        email_verified: true,
        username: 'Nik',
        phone_number: '070 295 125',
        first_name: 'Nik',
        last_name: 'Damiš',
        profile_picture_path: 'https://lh3.googleusercontent.com/a/ACg8ocK0srnktlj9IvCf1NGDiGq806g6-_0118R5DeuFSP5hYDnGtg=s96-c',
        google_id: '100187140092060771134',
        created_at: new Date('2025-10-25T20:47:32.928Z'),
    };

    return prisma.user.upsert({
        where: { email: data.email },
        update: {
            email_verified: data.email_verified,
            username: data.username,
            phone_number: data.phone_number,
            first_name: data.first_name,
            last_name: data.last_name,
            profile_picture_path: data.profile_picture_path,
            google_id: data.google_id,
        },
        create: data,
    });
}

async function getLookups() {
    const [activeStatus, location] = await Promise.all([
        prisma.productStatus.findUnique({ where: { name: 'active' } }),
        prisma.location.findFirst({ select: { id: true } }),
    ]);
    if (!activeStatus) throw new Error('Missing product status "active"');
    if (!location) throw new Error('No Location found. Create one before seeding.');
    return { activeStatusId: activeStatus.id, locationId: location.id };
}

function makeUniqueTitle(base, attempt) {
    return `${base} #${attempt}-${Date.now()}`;
}

async function ensureProduct({ ownerId, statusId, locationId, title, description, price, categoryNames = [], imageUrls = [] }) {
    const cats = await prisma.category.findMany({ where: { name: { in: categoryNames } } });

    let attempt = 0;
    // Always insert; on unique constraint, tweak title and retry
    while (true) {
        const finalTitle = attempt === 0 ? title : makeUniqueTitle(title, attempt);
        try {
            const created = await prisma.product.create({
                data: {
                    title: finalTitle,
                    description,
                    price,
                    user: { connect: { id: ownerId } },
                    status: { connect: { id: statusId } },
                    location: { connect: { id: locationId } },
                    images: {
                        create: imageUrls.map((url, i) => ({ url, isPrimary: i === 0 })),
                    },
                    categories: {
                        create: cats.map((c) => ({
                            category: { connect: { id: c.id } },
                        })),
                    },
                },
                select: { id: true },
            });
            return created;
        } catch (e) {
            if (e && e.code === 'P2002') {
                attempt += 1;
                continue;
            }
            throw e;
        }
    }
}

async function seedDomainData() {
    const userNik = await seedUserNik();
    const { activeStatusId, locationId } = await getLookups();

    // Create 10 products: Product1..Product10
    for (let i = 0; i < 10; i++) {
        const idx = i + 1;
        await ensureProduct({
            ownerId: userNik.id,
            statusId: activeStatusId,
            locationId,
            title: `Product${idx}`,
            description: `Demo product prod${idx}`,
            price: 10 * idx + 0.99,
            categoryNames: idx % 2 === 0 ? ['computers'] : ['electronics'],
            imageUrls: [uploadImages[i]],
        });
    }
}

async function seed() {
    try {
        await seedCore();
        await seedDomainData();
        console.log('Seeding complete');
    } catch (err) {
        console.error('Seeding failed', err);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

if (require.main === module) {
    seed();
}

module.exports = { seed };