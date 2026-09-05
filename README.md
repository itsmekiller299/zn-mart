# ZN Mart - Premium E-Commerce Platform

ZN Mart is a complete, production-ready, scalable e-commerce platform built with the MERN stack (MongoDB, Express, React, Node.js) and Redux Toolkit. It features a modern, premium UI with a purple (#6C4CF1) and white theme.

## 🚀 Tech Stack

### Frontend
- **React (Vite)**: Fast, modern frontend build tool.
- **Tailwind CSS**: Utility-first styling for a responsive, mobile-first design.
- **Redux Toolkit**: Global state management for Auth, Cart, and Products.
- **React Router DOM**: Client-side routing.
- **Axios**: Promise-based HTTP client for API requests.

### Backend
- **Node.js + Express**: Scalable backend architecture using the MVC pattern.
- **MongoDB + Mongoose**: NoSQL database and Object Data Modeling.
- **Authentication**: JWT (JSON Web Tokens) with access & refresh tokens, plus bcrypt for password hashing.
- **Security**: Helmet, CORS, and Express Rate Limiting.

## 📁 Folder Structure

```text
zn-mart/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/            # Redux store setup
│   │   ├── components/     # Reusable UI components
│   │   ├── features/       # Redux slices
│   │   ├── pages/          # Page components (Home, Cart, etc.)
│   │   └── services/       # API abstraction
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (Local instance or MongoDB Atlas URI)

### 1. Clone the repository
Ensure you are in the root directory of the project.

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   Create a `.env` file in the `backend/` directory and add the following:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=7d
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   FRONTEND_URL=http://localhost:5173
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
The frontend will be running on `http://localhost:5173`.

## 🏗️ Build Commands

To build the frontend for production:
```bash
cd frontend
npm run build
```
This will generate a `dist/` directory containing the optimized production bundle.

## 🚀 Deployment Guide

### Frontend → Vercel
1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com/) and create a new project.
3. Import your GitHub repository.
4. Set the **Framework Preset** to `Vite`.
5. Set the **Root Directory** to `frontend`.
6. Add any required environment variables (e.g., `VITE_API_URL` pointing to your deployed backend).
7. Click **Deploy**.

### Backend → Render / Railway
1. Go to [Render](https://render.com/) or [Railway](https://railway.app/).
2. Create a new Web Service and link your GitHub repository.
3. Set the **Root Directory** to `backend`.
4. Set the **Build Command** to `npm install`.
5. Set the **Start Command** to `node server.js`.
6. Add all the variables from your `.env` file to the platform's Environment Variables section.
7. Deploy the service. Make sure to update the `FRONTEND_URL` variable to your Vercel domain.

### Database → MongoDB Atlas
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas/database).
2. Create a Database User and save the credentials.
3. In Network Access, allow access from anywhere (`0.0.0.0/0`) or whitelist your Render/Railway IP.
4. Get your connection string and add it to your backend's `MONGO_URI` environment variable.

## 🔐 Features Included
- **User Authentication**: Secure login and registration with JWT.
- **Admin Panel**: Manage products, users, categories, and orders.
- **Shopping Cart**: Persistent cart stored in the database.
- **Checkout Process**: Shipping address and mock payment flow.
- **Product Reviews**: Users can rate and review purchased items.
- **Search & Filtering**: Full-text search and category filtering.
