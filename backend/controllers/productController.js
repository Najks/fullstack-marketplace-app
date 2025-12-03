const prisma = require('../models/prismaClient')

function parseCategoryIds(raw) {
    if (raw == null) return [];
    const csv = Array.isArray(raw) ? raw.join(',') : String(raw);
    return Array.from(
        new Set(
            csv
                .split(',')
                .map(s => Number(s.trim()))
                .filter(Number.isFinite)
        )
    );
}

const addFavoriteStatus = async (products, currentUserId) => {
    if (!currentUserId) {
        return products.map(p => ({...p, isFavorite: false}));
    }

    const favorites = await prisma.favourite.findMany({
        where: {
            userId: currentUserId,
            productId: {in: products.map(p => p.id)}
        },
        select: {productId: true}
    });

    const favoriteIds = new Set(favorites.map(f => f.productId));
    return products.map(p => ({
        ...p,
        isFavorite: favoriteIds.has(p.id)
    }));
};


const createProduct = async (req, res) => {
    try {
        const { title, description, userId, statusId, categoryIds, location_city, location_country, price } = req.body;
        const categoryIdsInt = parseCategoryIds(req.body.categoryIds);

        if (!title || !description || !userId || !statusId || !categoryIds?.length || !location_city || price == null) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        const categoriesData = categoryIdsInt.map((id) => ({
            category: { connect: { id } },
        }));

        let imagesData = [];
        if (req.files?.length) {
            imagesData = req.files.map((file, index) => ({
                url: `/uploads/${file.filename}`,
                isPrimary: index === 0,
            }));
        }

        let location = await prisma.location.findFirst({
            where: {
                city: location_city,
                country: location_country || null,
            },
        });
        if (!location) {
            location = await prisma.location.create({
                data: {
                    city: location_city,
                    country: location_country || null,
                },
            });
        }

        const newProduct = await prisma.product.create({
            data: {
                title,
                description,
                price: Number(price),
                user: { connect: { id: Number(userId) } },
                status: { connect: { id: Number(statusId) } },
                location: { connect: { id: location.id } },
                categories: { create: categoriesData },
                images: { create: imagesData },
            },
            include: {
                categories: { include: { category: true } },
                images: true,
                status: true,
                location: true,
                user: { select: { id: true, username: true, email: true } },
            },
        });

        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

    const getAllProducts = async (req, res) => {
        try {
            const page = req.query.page ? Math.max(1, Number(req.query.page)) : 1;
            const limit = req.query.limit ? Math.max(1, Number(req.query.limit)) : 10;
            const skip = (page - 1) * limit;
            const currentUserId = req.body?.userId ? Number(req.body.userId) : null;

            const total = await prisma.product.count({
                where: { deleted_at: null, statusId: 1 }
            });

            const products = await prisma.product.findMany({
                where: { deleted_at: null, statusId: 1 },
                skip,
                take: limit,
                include: {
                    categories: { include: { category: true } },
                    user: { select: { id: true, username: true, email: true, phone_number: true } },
                    status: true,
                    images: true,
                    location: true
                },
            });

            const productsWithFavorites = await addFavoriteStatus(products, currentUserId);

            res.status(200).json({
                products: productsWithFavorites,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    const getProductById = async (req, res) => {
        try {
            const { id } = req.params;
            const currentUserId = req.body?.userId ? Number(req.body.userId) : null;

            const product = await prisma.product.findUnique({
                where: { id: Number(id), deleted_at: null },
                include: {
                    categories: { include: { category: true } },
                    user: { select: { id: true, username: true, email: true, phone_number: true } },
                    status: true,
                    location: true,
                    images: true
                }
            });

            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }

            const [productWithFavorite] = await addFavoriteStatus([product], currentUserId);

            res.status(200).json({ product: productWithFavorite });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };


    const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, statusId, location_city, location_country, price} = req.body || {};
        const categoryIdsInt = parseCategoryIds(req.body?.categoryIds);

        const existingProduct = await prisma.product.findUnique({
            where: { id: Number(id) },
        });

        if (!existingProduct || existingProduct.deleted_at) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const data = {};
        if (title !== undefined) data.title = title;
        if (description !== undefined) data.description = description;
        if (price !== undefined) data.price = parseFloat(price);
        if (statusId) data.status = { connect: { id: Number(statusId) } };

        // find or create new location
        if (location_city !== undefined || location_country !== undefined) {
            const existingLocation = await prisma.location.findFirst({
                where: { id: existingProduct.locationId }
            });

            const newCity = location_city !== undefined ? location_city : existingLocation?.city;
            const newCountry = location_country !== undefined ? location_country : existingLocation?.country;

            if (!newCity) {
                return res.status(400).json({ error: 'City is required for location.' });
            }

            let location = await prisma.location.findFirst({
                where: {
                    city: newCity,
                    country: newCountry || null
                }
            });

            if (!location) {
                location = await prisma.location.create({
                    data: {
                        city: newCity,
                        country: newCountry || null
                    }
                });
            }

            data.location = { connect: { id: location.id } };
        }

        if (req.files?.length) {
            const imagesData = req.files.map((file, index) => ({
                url: `/uploads/${file.filename}`,
                isPrimary: index === 0,
            }));
            data.images = { create: imagesData };
        }

        const updatedProduct = await prisma.product.update({
            where: { id: Number(id) },
            data,
            include: {
                categories: { include: { category: true } },
                status: true,
                images: true,
                location: true,
                user: { select: {
                    id: true, username: true, email: true
                    }},
            },
        });

        if (req.body.categoryIds !== undefined) {
            await prisma.categoryProduct.deleteMany({
                where: { productId: Number(id) },
            });

            if (categoryIdsInt.length) {
                await prisma.categoryProduct.createMany({
                    data: categoryIdsInt.map((cid) => ({
                        categoryId: cid,
                        productId: Number(id),
                    })),
                });
            }
        }

        return res.status(200).json({ updatedProduct });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Delete linking table entries first
        await prisma.categoryProduct.deleteMany({
            where: { productId: Number(id) }
        });

        // Then soft-delete the product
        const deletedProduct = await prisma.product.update({
            where: { id: Number(id) },
            data: { deleted_at: new Date() },
            select: {
                id: true,
                title: true,
                deleted_at: true,
            },
        });

        res.status(200).json({
            message: 'Product soft-deleted successfully',
            product: deletedProduct,
        });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(500).json({ error: error.message });
    }
};

    const getUserProducts = async (req, res) => {
        try {
            const {userId} = req.params;
            const uid = Number(userId);
            const page = req.query.page ? Math.max(1, Number(req.query.page)) : 1;
            const limit = req.query.limit ? Math.max(1, Number(req.query.limit)) : 10;
            const skip = (page - 1) * limit;
            const currentUserId = req.body?.userId ? Number(req.body.userId) : null;

            if (!Number.isFinite(uid)) {
                return res.status(400).json({error: 'Invalid userId'});
            }

            const total = await prisma.product.count({
                where: {
                    userId: uid,
                    deleted_at: null,
                }
            });

            const products = await prisma.product.findMany({
                where: {
                    userId: uid,
                    deleted_at: null,
                    statusId: 1
                },
                skip,
                take: limit,
                select: {
                    id: true,
                    title: true,
                    description: true,
                    price: true,
                    created_at: true,
                    updated_at: true,
                    statusId: true,
                    categories: {
                        select: {
                            category: {
                                select: {id: true, name: true}
                            }
                        }
                    },
                    images: {
                        select: {id: true, url: true, isPrimary: true}
                    },
                    status: {
                        select: {id: true, name: true}
                    },
                    location: {
                        select: {id: true, city: true, country: true}
                    },
                    user: {
                        select: {id: true, username: true, email: true}
                    }
                }
            });
            const productsWithFavorites = await addFavoriteStatus(products, currentUserId);

            return res.status(200).json({
                products: productsWithFavorites,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    };

    const getUsersSoldProducts = async (req, res) => {
    try {
        const { userId } = req.params;
        const uid = Number(userId);
        const page = req.query.page ? Math.max(1, Number(req.query.page)) : 1;
        const limit = req.query.limit ? Math.max(1, Number(req.query.limit)) : 10;
        const skip = (page - 1) * limit;

        if (!Number.isFinite(uid)) {
            return res.status(400).json({ error: 'Invalid userId' });
        }

        const total = await prisma.product.count({
            where: {
                userId: uid,
                deleted_at: null,
                statusId: 2
            }
        });

        const soldProducts = await prisma.product.findMany({
            where: {
                userId: uid,
                deleted_at: null,
                statusId: 2
            },
            skip,
            take: limit,
            select: {
                id: true,
                title: true,
                description: true,
                price: true,
                created_at: true,
                updated_at: true,
                statusId: true,
                categories: {
                    select: {
                        category: {
                            select: { id: true, name: true }
                        }
                    }
                },
                images: {
                    select: { id: true, url: true, isPrimary: true }
                },
                status: {
                    select: { id: true, name: true }
                },
                location: {
                    select: { id: true, city: true, country: true }
                },
                user: {
                    select: { id: true, username: true, email: true }
                }
            }
        });

        return res.status(200).json({
            products: soldProducts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


    const getProductsByCategory = async (req, res) => {
        const { categoryId } = req.params;
        const page = req.query.page ? Math.max(1, Number(req.query.page)) : 1;
        const limit = req.query.limit ? Math.max(1, Number(req.query.limit)) : 10;
        const skip = (page - 1) * limit;
        const currentUserId = req.body?.userId ? Number(req.body.userId) : null;

        if (!categoryId) {
            return res.status(400).json({ error: "missing categoryId" })
        }

        try {
            const total = await prisma.product.count({
                where: {
                    deleted_at: null, statusId: 1,
                    categories: {
                        some: {
                            categoryId: Number(categoryId)
                        }
                    }
                }
            });

            const products = await prisma.product.findMany({
                where: {
                    deleted_at: null, statusId: 1,
                    categories: {
                        some: {
                            categoryId: Number(categoryId)
                        }
                    },
                },
                skip,
                take: limit,
                select: {
                    id: true,
                    title: true,
                    description: true,
                    price: true,
                    created_at: true,
                    categories: {
                        select: { category: { select: { id: true, name: true } } }
                    },
                    images: {
                        select: { id: true, url: true, isPrimary: true }
                    },
                    status: { select: { id: true, name: true } },
                    location: { select: { id: true, city: true, country: true } },
                    user: { select: { id: true, username: true, email: true } }
                }
            });

            const productsWithFavorites = await addFavoriteStatus(products, currentUserId);

            return res.status(200).json({
                products: productsWithFavorites,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            })
        } catch (error) {
            return res.status(500).json({ error: error.message })
        }
    };

    const searchAndFilterProducts = async (req, res) => {
        try {
            const { q, minPrice, maxPrice, location, sort, sortBy, sortDir } = req.query;
            const page = req.query.page ? Math.max(1, Number(req.query.page)) : 1;
            const limit = req.query.limit ? Math.max(1, Number(req.query.limit)) : 10;
            const skip = (page - 1) * limit;
            const where = { deleted_at: null, statusId: 1 };
            const currentUserId = req.body?.userId ? Number(req.body.userId) : (req.query?.userId ? Number(req.query.userId) : null);            if (q && q.trim().length > 0) {
                const searchTerm = q.trim().slice(0, 100);
                where.OR = [
                    { title: { contains: searchTerm, mode: 'insensitive' } },
                    { description: { contains: searchTerm, mode: 'insensitive' } },
                ];
            }

            if (minPrice !== undefined || maxPrice !== undefined) {
                let min = minPrice !== undefined ? Number(minPrice) : null;
                let max = maxPrice !== undefined ? Number(maxPrice) : null;

                if ((min !== null && !Number.isFinite(min)) || (max !== null && !Number.isFinite(max))) {
                    return res.status(400).json({ error: 'Invalid price values' });
                }
                if ((min !== null && min < 0) || (max !== null && max < 0)) {
                    return res.status(400).json({ error: 'Prices must be non-negative' });
                }
                if (min !== null && max !== null && min > max) {
                    return res.status(422).json({ error: 'Max price must be higher than min price' });
                }

                where.price = {};
                if (min !== null) where.price.gte = min;
                if (max !== null) where.price.lte = max;
            }

            if (location) {
                where.location = {
                    city: { contains: location.trim().slice(0, 100), mode: 'insensitive' },
                };
            }

            const FIELD_MAP = { created_at: 'created_at', price: 'price', title: 'title' };
            const DIRS = new Set(['asc', 'desc']);

            let field = 'created_at';
            let direction = 'desc';

            if (typeof sort === 'string') {
                const [f, d] = sort.split(':');
                if (FIELD_MAP[f]) field = FIELD_MAP[f];
                if (d && DIRS.has(d.toLowerCase())) direction = d.toLowerCase();
            } else {
                if (FIELD_MAP[sortBy]) field = FIELD_MAP[sortBy];
                if (sortDir && DIRS.has(String(sortDir).toLowerCase())) direction = String(sortDir).toLowerCase();
            }

            const orderBy = [{ [field]: direction }];

            const total = await prisma.product.count({ where });

            const products = await prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                select: {
                    id: true,
                    title: true,
                    description: true,
                    price: true,
                    created_at: true,
                    statusId: true,
                    categories: { select: { category: { select: { id: true, name: true } } } },
                    images: { select: { id: true, url: true, isPrimary: true } },
                    status: { select: { id: true, name: true } },
                    location: { select: { id: true, city: true, country: true } },
                    user: { select: { id: true, username: true, email: true } },
                },
            });

            const productsWithFavorites = await addFavoriteStatus(products, currentUserId);

            return res.status(200).json({
                products: productsWithFavorites,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            });
        } catch (error) {
            console.error('Search and filter error:', error);
            return res.status(500).json({ error: 'Search failed' });
        }
    };

const productCountByCategory = async (req,res) => {
    const {categoryId} = req.params
    try {
        const count = await prisma.product.count({
            where: {
                deleted_at: null, statusId: 1,
                categories: {
                    some: {
                        categoryId: Number(categoryId)
                    }
                }
            }
        })

        return res.status(200).json({count})
    } catch (error) {
        return res.status(500).json({error: error.message})
    }
}

const productCountByUser  = async (req,res) => {
    try {
        const { userId } = req.params;

        const count = await prisma.product.count({
            where: {
                deleted_at: null,
                userId: Number(userId),
            }
        })
        return res.status(200).json({count: count})
    } catch (error) {
        return res.status(500).json({error: error.message})
    }
}


module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getUserProducts,
    getProductsByCategory,
    searchAndFilterProducts,
    productCountByCategory,
    productCountByUser,
    getUsersSoldProducts,
};