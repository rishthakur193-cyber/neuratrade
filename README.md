# NeuraTrade
A production-ready, ultra-premium institutional mobile AI trading platform for Indian markets.

## Public API
The production API is live at:
**https://neuratrade-api-nzi5eu3gha-el.a.run.app**

## Deployment Architecture
- **Infrastructure**: Google Cloud Run (Serverless)
- **Region**: `asia-south1`
- **CI/CD**: Google Cloud Build (GitHub Trigger)
- **Database**: Prisma with SQLite (Production hardening in progress)
- **Containerization**: Multi-stage Docker build

## Development & Deployment
Pushing to the `main` branch automatically triggers the Cloud Build pipeline, which:
1. Builds the Docker container.
2. Pushes the image to Artifact Registry.
3. Deploys to Cloud Run with automatic health verification.

## Local Development
1. Install dependencies:
   ```bash
   cd server
   npm install
   ```
2. Set environment variables in `.env`.
3. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```
4. Run development server:
   ```bash
   npm run dev
   ```

## Health Checks
- **Stateless Health**: `GET /health`
- **Advisor List**: `GET /advisor/list`
- **Investor Dashboard**: `GET /investor/dashboard`
- **Signal Feed**: `GET /signal/feed`

All endpoints return JSON responses.
