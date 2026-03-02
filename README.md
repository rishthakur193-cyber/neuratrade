# NeuraTrade
A production-ready, ultra-premium institutional mobile AI trading platform for Indian markets.

## Prerequisites
- Node.js (v20+)
- PostgreSQL Database
- Angel One SmartAPI Credentials

## Environment Setup
1. Copy `.env.example` to `.env` in the root of the application (e.g., inside `web-app`).
2. Fill in the required credentials, notably `DATABASE_URL` and `NEXTAUTH_SECRET`.

## Installation
Navigate to your primary web application folder:
```bash
cd web-app
npm install
```

## Database Initialization
Once your PostgreSQL database is reachable at `DATABASE_URL`, sync the Prisma schema:
```bash
npx prisma generate
npx prisma db push
```
*(Note: Use `npx prisma migrate deploy` if migrating a pre-existing production schema.)*

## Production Build
Build the Next.js application:
```bash
npm run build
```

## Running the Application
To start the production server:
```bash
npm run start
```

## Container Deployment
A multi-stage `Dockerfile` is included in `web-app/Dockerfile` optimized for Next.js standalone outputs. Use this to deploy to services like Google Cloud Run or AWS ECS.

```bash
docker build -t neuratrade .
docker run -p 3000:3000 --env-file .env neuratrade
```

## Health Checks
Load balancers can actively ping the stateless health endpoint:
`GET /api/health`
