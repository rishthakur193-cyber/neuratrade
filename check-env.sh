#!/bin/bash
# =============================================================================
# NeuraTrade Environment Validator
# Run after staging-setup.sh to verify all required env vars are present.
# Usage: chmod +x check-env.sh && ./check-env.sh
# =============================================================================

ENV_FILE="$(cd "$(dirname "$0")/web-app" && pwd)/.env"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}ERROR: .env file not found at $ENV_FILE${NC}"
    exit 1
fi

source "$ENV_FILE"

PASS=0
FAIL=0

check() {
    local name="$1"
    local value="$2"
    local required="$3"
    if [ -n "$value" ]; then
        echo -e "${GREEN}  ✓${NC} ${name}"
        PASS=$((PASS+1))
    elif [ "$required" = "required" ]; then
        echo -e "${RED}  ✗${NC} ${name} — MISSING (required)"
        FAIL=$((FAIL+1))
    else
        echo -e "${YELLOW}  -${NC} ${name} — not set (optional)"
    fi
}

echo ""
echo "=== NeuraTrade Environment Validation ==="
echo ""
echo "Core:"
check "DATABASE_URL"         "$DATABASE_URL"         "required"
check "NEXTAUTH_SECRET"      "$NEXTAUTH_SECRET"      "required"
check "NODE_ENV"             "$NODE_ENV"             "required"

echo ""
echo "Email:"
check "SMTP_HOST"            "$SMTP_HOST"            "required"
check "SMTP_PORT"            "$SMTP_PORT"            "required"
check "SMTP_USER"            "$SMTP_USER"            "required"
check "SMTP_PASS"            "$SMTP_PASS"            "required"
check "SMTP_FROM"            "$SMTP_FROM"            ""

echo ""
echo "Broker:"
check "SMARTAPI_API_KEY"     "$SMARTAPI_API_KEY"     ""
check "ENABLE_REAL_TRADING"  "$ENABLE_REAL_TRADING"  ""

echo ""
echo "Storage:"
check "GCS_BUCKET_NAME"      "$GCS_BUCKET_NAME"      ""
check "GOOGLE_APPLICATION_CREDENTIALS" "$GOOGLE_APPLICATION_CREDENTIALS" ""

echo ""
echo "======================================="
echo -e "  ${GREEN}Passed:${NC} $PASS   ${RED}Failed:${NC} $FAIL"
echo "======================================="

# Safety check
if [ "$ENABLE_REAL_TRADING" = "true" ]; then
    echo -e "${RED}  ⚠ WARNING: ENABLE_REAL_TRADING is true!${NC}"
    echo -e "${RED}      Real broker orders WILL execute. Set to false for staging!${NC}"
fi

[ $FAIL -eq 0 ] && exit 0 || exit 1
