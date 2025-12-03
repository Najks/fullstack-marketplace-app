const express = require('express');
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require('./routes/categoryRoutes');
const productsRoutes = require('./routes/productRoutes')
const authRoutes = require('./routes/authRoutes')
const {seed} = require('./prisma/seed')
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: true
})
const uploadMw = require('./middlewares/upload');


const app = express();
async function start() {
    try{
        await seed();

        app.use(cors({
            origin: ["http://localhost:5500", "http://localhost:5000", "http://localhost:5173"],
            credentials: true
        }));
        uploadMw.serveUploads(app);
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use(limiter);
        app.use(helmet())
        app.use(cookieParser());
        app.use('/api/users', userRoutes)
        app.use('/api/categories', categoryRoutes)
        app.use('/api/products', productsRoutes)
        app.use('/api/auth', authRoutes)

        app.use((req, res) => {
            res.status(404).json({
                error: 'Not Found',
                message: 'The requested resource does not exist',
                path: req.path
            });
        });

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
    } catch (error){
        console.log(error)
        process.exit(1);
    }
}

start();

