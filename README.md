# Flight Booking System Backend

A robust backend system for managing flight bookings, user management, and travel-related operations.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Installation](#installation)
- [Running the Server](#running-the-server)
- [Other Commands](#other-commands)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Project Contributors](#project-contributors)

## Features

- User Authentication and Authorization (Admin/User roles)
- Flight Management
- Booking System
- Passenger Management
- Airport and Airline Management
- Payment Integration with Midtrans
- Notification System
- OTP Verification

## Tech Stack

- Node.js
- PostgreSQL
- Prisma ORM
- Express.js
- Json Web Token
- Swagger
- Midtrans
- ImageKit
- Passport.js
- Nodemailer
- Jest
- PM2

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- npm or yarn
- ImageKit account
- Midtrans account
- Google OAuth credentials
- Email service credentials

## Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env`
3. Update the `.env` file with your configurations:

```env
# Database
DATABASE_URL="postgresql://postgres:root@localhost:5432/testingch?schema=public"

# CORS
FRONTEND_URL="http://localhost:5173"

# Error Tracking
SENTRY_DSN="your_sentry_dsn"

# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY="your_public_key"
IMAGEKIT_PRIVATE_KEY="your_private_key"
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your_endpoint"

# Midtrans Payment Gateway
MIDTRANS_SERVER_KEY="your_server_key"
MIDTRANS_CLIENT_KEY="your_client_key"

# Security
SALT_ROUNDS=10
JWT_SECRET_KEY="your_jwt_secret"
JWT_ACCESS_TOKEN_EXPIRES_IN="1h"

# Cookies
COOKIE_EXPIRED=24
COOKIE_DOMAIN=

# Email Service
EMAIL_USER="your_email"
EMAIL_PASS="your_email_password"

# OTP Configuration
OTP_EXPIRY_MINUTES=1
MAX_OTP_ATTEMPTS=3

# Google OAuth
GOOGLE_CLIENT_ID="your_client_id"
GOOGLE_CLIENT_SECRET="your_client_secret"
GOOGLE_CALLBACK_URL="your_callback_url"
SESSION_SECRET="your_session_secret"
```

## Installation

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database
npm run seed
```

## Running the Server

```bash
# Start the server as development
npm run dev

# Start the server as production
npm run start
```

## Other Commands

```bash
# Delete all data in database
npm run deleteSeed
```

## Database Schema

The system includes the following main entities:
- Users (with role-based access)
- Flights
- Airports
- Airlines
- Passengers
- Tickets
- Transactions
- Notifications
- OTP Management

## API Documentation

The API documentation is available through Swagger UI. After starting the server, you can access it at:

```
http://localhost:3000/api/docs
```

## Testing

The project uses Jest for testing. 

### Running Tests

```bash
# Run specific test file
npx jest profile.test.js --detectOpenHandles
```

## Project Contributors

| Avatar | Name | GitHub |
|--------|------|--------|
| <img src="https://github.com/krisnaepras.png?size=50"> | Krisna Eko Prasetyo | [@krisnaepras](https://github.com/krisnaepras) |
| <img src="https://github.com/0xtbug.png?size=50"> | Ahmad Tubagus Nabil Maulana | [@0xtbug](https://github.com/0xtbug) |
| <img src="https://github.com/Yogananda2004.png?size=50"> | I Gede Yogananda | [@Yogananda2004](https://github.com/Yogananda2004) |
| <img src="https://github.com/okkysatria.png?size=50"> | Okky Satria | [@okkysatria](https://github.com/okkysatria) |

Binar Academy Batch 7, MSIB 2024