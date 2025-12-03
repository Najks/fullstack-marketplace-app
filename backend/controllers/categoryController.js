const prisma = require('../models/prismaClient')

const getCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            include: {
                products: {
                    where: {
                        deleted_at: null
                    },
                    select: {
                        id: true
                    }
                }
            }
        });

        const categoriesWithCount = categories.map(category => ({
            id: category.id,
            name: category.name,
            productCount: category.products.length
        }));

        return res.status(200).json(categoriesWithCount);
    } catch (error) {
        console.error('Error in getCategories:', error);
        return res.status(500).json({ error: error.message });
    }
};

const getCategory = async (req,res) => {
    try {
        const {id} = req.params;
        const category = await prisma.category.findUnique({
            where: {
                id: Number(id)
            }
        });
        res.status(200).json({category});
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const category = await prisma.category.create({
            data: {name: name}
        })

        res.json(category).status(200)
    } catch (error) {
        res.json({error: error.message}).status(500)
    }
}

const updateCategory = async (req,res) => {
    try {
        const {id} = req.params
        const name = req.body
        console.log(name)
        const category = prisma.category.update({
            where: {
                id: Number(id)
            },
            data: {
                name: name
            },
            select: {
                name: true
            }
        })

        res.json(category).status(200);
    } catch (error){
        res.json({error: error.message}).status(500)
    }
}

const deleteCategory = async (req,res) => {
    try{
        const {id} = req.params;
        const category = prisma.category.delete({
            where: {
                id: {id}
            }
        })

        res.json(category).status(200)
    } catch(error){
        res.json({error: error.message})
    }
}

module.exports = {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
};
