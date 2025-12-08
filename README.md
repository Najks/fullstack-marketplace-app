# Express Marketplace App

A full-stack marketplace application built with React and Express.js, featuring user authentication, product listings, categories, and favorites functionality.

## Features

- JWT & Google OAuth 2.0 authentication
- Product CRUD operations with multiple image uploads
- Category-based organization and filtering
- User favorites functionality
- Profile management with custom avatars
- Protected routes for authenticated users
- Search and advanced filtering

## Tech Stack

**Frontend:** React 19, React Router 7, Vite 7, Axios, Bootstrap 5  
**Backend:** Node.js, Express 5, Prisma 6, PostgreSQL, JWT, Multer  
**Security:** Helmet, Express Rate Limit, Bcrypt

## Backend Features

### Authentication & Authorization
- JWT-based authentication with secure token generation
- Google OAuth 2.0 integration using Google Auth Library
- Authentication middleware for protected routes
- Token verification and user session management

### Database & ORM
- Prisma ORM for type-safe database queries
- PostgreSQL relational database
- Migration system for database version control
- Database seeding scripts for initial data
- Soft delete functionality for data preservation

### API Architecture
- RESTful API design with Express.js
- Modular route structure (auth, users, products, categories)
- Controller-based request handling
- Input validation with Express Validator
- Centralized error handling

### File Management
- Multer middleware for file uploads
- Support for multiple image uploads per product
- File type and size validation
- Organized file storage in uploads directory

### Security Features
- Helmet.js for HTTP header security
- Express Rate Limit for API rate limiting
- CORS configuration for cross-origin requests
- Cookie parser for secure cookie handling
- Request validation and sanitization

### Data Models
- User management with profile customization
- Product listings with relationships (images, categories, location)
- Category system with many-to-many relationships
- Product status tracking (Available, Sold, Reserved)
- User favorites/wishlist functionality
- Location-based product information

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn
- Google OAuth credentials (optional)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Najks/fullstack-marketplace-app
cd fullstack-marketplace-app
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in the `backend` directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/marketplace_db"
JWT_SECRET="your-secret-key"
PORT=5000
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
FRONTEND_URL="http://localhost:5173"
```

Run database migrations:

```bash
npx prisma migrate dev
npx prisma generate
```

Optional - seed the database:

```bash
node prisma/seed.js
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID="your-google-client-id"
```

## Running the Application

**Backend:**
```bash
cd backend
npm start
# or for development with auto-reload:
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth login

### Users
- `GET /api/users/profile` - Get current user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (protected)
- `PUT /api/products/:id` - Update product (protected)
- `DELETE /api/products/:id` - Delete product (protected)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id/products` - Get products by category

### Favorites
- `GET /api/users/favorites` - Get user favorites (protected)
- `POST /api/users/favorites/:productId` - Add to favorites (protected)
- `DELETE /api/users/favorites/:productId` - Remove from favorites (protected)

## Database Schema

**User** - User accounts with local and OAuth authentication  
**Product** - Product listings with images, price, status, and location  
**Category** - Product categories (many-to-many with products)  
**ProductImage** - Multiple images per product  
**ProductStatus** - Product status (Available, Sold, Reserved)  
**Location** - City and country information  
**Favourite** - User favorite products

## Protected Routes

The following routes require authentication:
- `/profile` - View user profile
- `/profile/edit` - Edit profile
- `/my-products` - User's products
- `/create-product` - Create product
- `/products/:productId/edit` - Edit product
- `/my-favorites` - Favorite products

## Project Structure

```
Express-Marketplace-App/
├── backend/
│   ├── controllers/          # Request handlers
│   ├── middlewares/          # Auth, validation, upload
│   ├── models/               # Prisma client
│   ├── prisma/               # Schema and migrations
│   ├── routes/               # API routes
│   ├── uploads/              # Uploaded files
│   └── server.js             # Entry point
└── frontend/
    └── src/
        ├── api/              # API client functions
        ├── components/       # Reusable components
        ├── context/          # React context
        ├── pages/            # Page components
        └── App.jsx           # Main component
```

## Development Commands

**Prisma:**
```bash
npx prisma generate          # Generate client
npx prisma migrate dev       # Run migrations
npx prisma studio            # Open database GUI
```

**Frontend:**
```bash
npm run dev                  # Start dev server
npm run build                # Build for production
npm run preview              # Preview production build
```

## Author

GitHub: [@Najks](https://github.com/Najks)
