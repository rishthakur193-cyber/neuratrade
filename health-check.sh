#!/bin/bash
# =============================================================================
# NeuraTrade Health Check & Smoke Test
# Run after startup to validate all critical systems.
# Usage: chmod +x health-check.sh && ./health-check.sh [host]
# =============================================================================

HOST="${1:-localhost:3000}"
BASE="http://$HOST"
PASS=0
FAIL=0

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo "=============================================="
echo "  NeuraTrade Health Check — $HOST"
echo "=============================================="
echo ""

check_endpoint() {
    local name="$1"
    local url="$2"
    local expected_code="$3"
    local data="$4"
    local content_type="${5:-application/json}"

    if [ -n "$data" ]; then
        RESPONSE=$(curl -s -o /tmp/nt_response -w "%{http_code}" -X POST \
            -H "Content-Type: $content_type" \
            -d "$data" "$url" 2>/dev/null)
    else
        RESPONSE=$(curl -s -o /tmp/nt_response -w "%{http_code}" "$url" 2>/dev/null)
    fi

    BODY=$(cat /tmp/nt_response 2>/dev/null)

    if [ "$RESPONSE" = "$expected_code" ]; then
        echo -e "${GREEN}  ✓${NC} $name (HTTP $RESPONSE)"
        PASS=$((PASS+1))
    else
        echo -e "${RED}  ✗${NC} $name (HTTP $RESPONSE, expected $expected_code)"
        echo "    Response: $BODY" | head -c 200
        echo ""
        FAIL=$((FAIL+1))
    fi
}

# 1. Health check endpoint — verifies DB connectivity
check_endpoint "Health Check (+DB ping)" "$BASE/api/health" "200"

HEALTH_BODY=$(cat /tmp/nt_response)
DB_STATUS=$(echo "$HEALTH_BODY" | grep -o '"database":"[^"]*"' | cut -d'"' -f4)
echo "       DB Backend: ${DB_STATUS:-unknown}"

# 2. Auth — register a test user
TEST_EMAIL="healthcheck_$(date +%s)@test.neuratrade"
check_endpoint "Auth Register" "$BASE/api/auth/register" "201" \
    "{\"name\":\"Health Bot\",\"email\":\"$TEST_EMAIL\",\"password\":\"StagingTest@123\"}"

# 3. Auth — login
check_endpoint "Auth Login" "$BASE/api/auth/login" "200" \
    "{\"email\":\"$TEST_EMAIL\",\"password\":\"StagingTest@123\"}"

LOGIN_TOKEN=$(cat /tmp/nt_response | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# 4. Auth — me (protected route)
if [ -n "$LOGIN_TOKEN" ]; then
    RESPONSE=$(curl -s -o /tmp/nt_response -w "%{http_code}" \
        -H "Authorization: Bearer $LOGIN_TOKEN" "$BASE/api/auth/me")
    if [ "$RESPONSE" = "200" ]; then
        echo -e "${GREEN}  ✓${NC} Auth /me protection (HTTP 200)"
        PASS=$((PASS+1))
    else
        echo -e "${RED}  ✗${NC} Auth /me protection (HTTP $RESPONSE)"
        FAIL=$((FAIL+1))
    fi
else
    echo -e "${YELLOW}  -${NC} Auth /me skipped (no token)"
fi

# 5. Homepage loads
check_endpoint "Frontend (Homepage)" "$BASE" "200"

echo ""
echo "======================================="
echo -e "  ${GREEN}Tests Passed:${NC} $PASS"
echo -e "  ${RED}Tests Failed:${NC} $FAIL"
echo "======================================="
echo ""

[ $FAIL -eq 0 ] && echo -e "${GREEN}  STAGING IS HEALTHY ✓${NC}" || echo -e "${RED}  STAGING NEEDS ATTENTION${NC}"
echo ""
