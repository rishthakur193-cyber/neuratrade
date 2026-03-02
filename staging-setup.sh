#!/bin/bash
# =============================================================================
# NeuraTrade Staging Setup Script
# Run this ONCE on your Ubuntu server to complete all staging configuration.
# Usage: chmod +x staging-setup.sh && ./staging-setup.sh
# =============================================================================

set -e  # Exit on any error

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log()    { echo -e "${GREEN}[SETUP]${NC} $1"; }
warn()   { echo -e "${YELLOW}[WARN]${NC}  $1"; }
ask()    { echo -e "${YELLOW}[INPUT]${NC} $1"; }

echo ""
echo "=============================================="
echo "  NeuraTrade — Automated Staging Setup"
echo "=============================================="
echo ""
warn "This script is for STAGING only. Real trading is DISABLED."
echo ""

APP_DIR="$(cd "$(dirname "$0")/web-app" && pwd)"
ENV_FILE="$APP_DIR/.env"

# ── Step 1: Collect required secrets ──────────────────────────────────────────
log "Step 1/7 — Collecting environment credentials"
echo ""

ask "Paste your Supabase (or PostgreSQL) DATABASE_URL:"
ask "(Format: postgres://user:pass@host:5432/db?sslmode=require)"
read -r DATABASE_URL

ask "Paste your Mailtrap SMTP username:"
read -r SMTP_USER

ask "Paste your Mailtrap SMTP password:"
read -rs SMTP_PASS
echo ""

ask "Paste your Angel One SmartAPI API Key (leave blank to skip):"
read -r SMARTAPI_KEY

# ── Step 2: Generate secrets ───────────────────────────────────────────────────
log "Step 2/7 — Generating NEXTAUTH_SECRET (48 bytes)"
NEXTAUTH_SECRET=$(node -e "const c=require('crypto');console.log(c.randomBytes(48).toString('base64'))")
log "Secret generated: [hidden]"

# ── Step 3: Write .env ─────────────────────────────────────────────────────────
log "Step 3/7 — Writing .env to $ENV_FILE"

cat > "$ENV_FILE" <<EOF
# NeuraTrade Staging Environment — Auto-generated $(date)
DATABASE_URL="${DATABASE_URL}"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"
SMARTAPI_API_KEY="${SMARTAPI_KEY}"
ENABLE_REAL_TRADING="false"
SMTP_HOST="sandbox.smtp.mailtrap.io"
SMTP_PORT="2525"
SMTP_SECURE="false"
SMTP_USER="${SMTP_USER}"
SMTP_PASS="${SMTP_PASS}"
SMTP_FROM='"NeuraTrade Staging" <staging@neuratrade.ecosystem>'
GCS_BUCKET_NAME=""
GOOGLE_APPLICATION_CREDENTIALS=""
NODE_ENV="production"
EOF

log ".env written."
warn "IMPORTANT: .env is gitignored and will NOT be committed."

# ── Step 4: Install dependencies & generate Prisma ────────────────────────────
log "Step 4/7 — Installing dependencies"
cd "$APP_DIR"
npm install --omit-dev

log "Generating Prisma client"
npx prisma generate

log "Pushing schema to database (non-destructive)"
npx prisma db push --accept-data-loss=false

log "Seeding database with test accounts"
npx prisma db seed || warn "Seed skipped (accounts may already exist)"

# ── Step 5: Production build ───────────────────────────────────────────────────
log "Step 5/7 — Running production build"
npm run build

# ── Step 6: Restart PM2 ───────────────────────────────────────────────────────
log "Step 6/7 — Restarting application"
if pm2 list | grep -q "neuratrade"; then
    pm2 restart neuratrade
    log "PM2 process restarted."
else
    pm2 start npm --name "neuratrade" -- start
    pm2 save
    pm2 startup
    warn "PM2 startup command printed above — copy and run it to survive reboots."
fi

# ── Step 7: Health check ───────────────────────────────────────────────────────
log "Step 7/7 — Running health check (waiting 5s for boot)"
sleep 5

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)
if [ "$HTTP_STATUS" = "200" ]; then
    log "Health check PASSED ✓ (HTTP 200)"
    HEALTH_BODY=$(curl -s http://localhost:3000/api/health)
    log "Response: $HEALTH_BODY"
else
    warn "Health check returned HTTP $HTTP_STATUS"
    warn "Check PM2 logs: pm2 logs neuratrade --lines 50"
fi

# ── Summary ────────────────────────────────────────────────────────────────────
echo ""
echo "=============================================="
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "unknown")
echo "  Staging Setup Complete"
echo "  Public URL: http://$PUBLIC_IP"
echo "  Health:     http://$PUBLIC_IP/api/health"
echo "  Test login: investor@gmail.com / password123"
echo "=============================================="
echo ""
warn "Next steps for HTTPS:"
warn "  sudo apt install certbot python3-certbot-nginx -y"
warn "  sudo certbot --nginx -d yourdomain.com"
echo ""
