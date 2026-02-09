# Japan Autos - E-Commerce Application

## Overview
Full-stack e-commerce application for auto parts with a customer-facing frontend, admin panel, and Express.js backend.

## Project Architecture
- **frontend/** - React + Vite customer storefront (port 5000)
- **admin/** - React + Vite admin dashboard (port 5174)
- **backend/** - Express.js REST API (port 4000)
  - MongoDB (Mongoose) for data storage
  - Cloudinary for image uploads
  - Stripe/Razorpay for payments
  - JWT-based authentication

## Running the App
The workflow starts both the backend (port 4000) and frontend (port 5000).
The frontend proxies `/api` requests to the backend via Vite's dev server proxy.

## Key Environment Variables
- `MONGODB_URI` - MongoDB connection string
- `CLOUDINARY_API_KEY`, `CLOUDINARY_SECRET_KEY`, `CLOUDINARY_NAME` - Cloudinary config
- `JWT_SECRET` - JWT signing secret
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` - Admin login credentials
- `STRIPE_SECRET_KEY` - Stripe payment key
- `PORT` - Backend port (default 4000)

## Recent Changes
- 2026-02-09: Configured for Replit environment
  - Frontend Vite configured on port 5000 with allowedHosts and API proxy
  - Backend binds to 0.0.0.0
  - Environment variables set in Replit secrets
