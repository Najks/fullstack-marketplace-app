const prisma = require('../models/prismaClient')
const bcrypt = require('bcrypt');



const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                email_verified: true,
                first_name: true,
                last_name: true,
                phone_number: true,
                profile_picture_path: true,
                created_at: true
            }
        })
        res.json(users);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

const getUser = async (req, res) => {
    try {
        const user_id  = req.params.id;
        const user = await prisma.user.findUnique({
            where: {
                id: Number(user_id)
            },
            select: {
                id: true,
                username: true,
                email: true,
                email_verified: true,
                first_name: true,
                last_name: true,
                phone_number: true,
                profile_picture_path: true,
                created_at: true
            }
        });
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user).status(200);
    } catch (error){
        res.status(500).json({error: error.message})
    }
}


const createUser = async (req, res) => {
    try {
        const { username, email, password, phone_number, profile_picture_path } = req.body;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password_hash: hashedPassword,
                phone_number,
                profile_picture_path
            },
            select: {
                id: true,
                username: true,
                email: true,
                created_at: true
            }
        });

        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const {id} = req.params;
        const {username, email, phone_number, profile_picture_path, first_name, last_name} = req.body;

        const updateData = {username, email, phone_number, profile_picture_path, first_name, last_name};
        console.log(updateData);
        const updateUser = await prisma.user.update({
            where: {
                id: Number(id)
            },
            data: updateData,
            select: {
                id: true,
                username: true,
                email: true,
                first_name: true,
                last_name: true,
                phone_number: true,
                profile_picture_path: true,
                created_at: true
            }
        });

        res.status(200).json(updateUser);
    } catch(error) {
        res.status(500).json({error: error.message});
    }
}


const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedUser = await prisma.user.delete({
            where: { id: Number(id) },
            select: {
                id: true,
                username: true,
                email: true,
            }
        });

        res.status(200).json({
            message: "User deleted successfully",
            user: deletedUser
        });
    } catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(500).json({ error: error.message });
    }
};

const createFavouriteProduct = async (req, res) => {
    try {
        const { userId, productId } = req.params;

        if (!userId || !productId) {
            return res.status(400).json({ error: 'Missing userId or productId' });
        }

        const product = await prisma.product.findUnique({
            where: {id: Number(productId)}
        });

        const favouriteCheck = await prisma.favourite.findFirst({
            where: {
                userId: Number(userId),
                productId: Number(productId)
            }
        })

        if(favouriteCheck){
            return res.status(400).json({error: "favourite already exists"});
        }

        if(!product){
            return res.status(400).json({error: "product not found"})
        }

        const favourite = await prisma.favourite.create({
            data: {
                userId: Number(userId),
                productId: Number(productId)
            },
            include: {
                user: { select: { id: true, username: true } },
                product: { select: { id: true, title: true } }
            }
        });

        res.status(201).json(favourite);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Product already in favourites' });
        }
        res.status(500).json({ error: error.message });
    }
};

const getFavouriteProducts = async (req, res) => {
    try {
        const { userId } = req.params;
        const id = Number(userId);
        if (!Number.isFinite(id)) {
            return res.status(400).json({ error: 'Invalid userId' });
        }

        const favourites = await prisma.favourite.findMany({
            where: { userId: id, product: { statusId: 1 },

            },
            include: {
                product: {
                    include: {
                        // keep only relations that exist on Product
                        images: true,          // if you have a Product -> Image[] relation
                        status: true,          // if Product -> Status relation exists
                        location: true,        // if Product -> Location relation exists
                        user: {                // if Product -> User relation exists
                            select: {
                                id: true,
                                username: true,
                                profile_picture_path: true,
                            }
                        },
                        categories: true,
                    }
                }
            }
        });

        return res.status(200).json(favourites);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const deleteFavouriteProduct = async (req, res) => {
    try {
        const { userId, productId } = req.params;

        const favourite = await prisma.favourite.findFirst({
            where: {
                userId: Number(userId),
                productId: Number(productId),
            },
            select: { id: true, userId: true, productId: true }
        });

        if (!favourite) {
            return res.status(400).json({ error: "favourite product doesnt exist" });
        }

        const deletedFavourite = await prisma.favourite.delete({
            where: { id: favourite.id }
        });

        return res.status(200).json(deletedFavourite);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


module.exports = {
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    createFavouriteProduct,
    getFavouriteProducts,
    deleteFavouriteProduct,
}