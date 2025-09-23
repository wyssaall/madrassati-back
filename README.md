# Madrassati Backend

Runtime: Node.js
Framework: Express.js
Database: MongoDB + Mongoose
Auth: JWT (students, teachers, parents)

## Setup

1. Copy `.env.example` to `.env` and set values.
2. Install deps: `npm install`
3. Run dev: `npm run dev`

## Routes

- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/logout`
- GET `/api/auth/me` (Authorization: Bearer <token>)

