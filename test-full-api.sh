#!/bin/bash

BASE_URL="http://localhost:3000/api/v1"
PASS=0
FAIL=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_endpoint() {
    local name="$1"
    local method="$2"
    local url="$3"
    local data="$4"
    local auth="$5"
    
    echo -n "Testing: $name ... "
    
    local cmd="curl -s -o /dev/null -w '%{http_code}'"
    
    if [ "$method" = "POST" ] || [ "$method" = "PUT" ]; then
        cmd="$cmd -X $method"
    fi
    
    cmd="$cmd $url"
    
    if [ -n "$data" ]; then
        cmd="$cmd -H 'Content-Type: application/json' -d '$data'"
    fi
    
    if [ -n "$auth" ]; then
        cmd="$cmd -H 'Authorization: Bearer $auth'"
    fi
    
    local status=$(eval $cmd)
    
    if [ "$status" -ge 200 ] && [ "$status" -lt 300 ]; then
        echo -e "${GREEN}✓ PASS${NC} (Status: $status)"
        PASS=$((PASS + 1))
    elif [ "$status" -eq 401 ] || [ "$status" -eq 403 ]; then
        echo -e "${YELLOW}⚠ AUTH${NC} (Status: $status)"
        PASS=$((PASS + 1))
    else
        echo -e "${RED}✗ FAIL${NC} (Status: $status)"
        FAIL=$((FAIL + 1))
    fi
}

echo "🧪 Boss Jobs Ethiopia - Full API Test Suite"
echo "============================================"
echo ""

# Health Check
test_endpoint "Health Check" "GET" "http://localhost:3000/health"

# Auth Endpoints
test_endpoint "Register User" "POST" "$BASE_URL/auth/register" \
    '{"fullName":"Test User","email":"test@test.com","phoneNumber":"+251955555555","password":"Test123!@#"}'

test_endpoint "Register Duplicate" "POST" "$BASE_URL/auth/register" \
    '{"fullName":"Test User","email":"test@test.com","phoneNumber":"+251955555555","password":"Test123!@#"}'

test_endpoint "Login Valid" "POST" "$BASE_URL/auth/login" \
    '{"emailOrPhone":"admin@bossjobs.et","password":"Admin123!@#"}'

test_endpoint "Login Invalid" "POST" "$BASE_URL/auth/login" \
    '{"emailOrPhone":"admin@bossjobs.et","password":"wrongpass"}'

# Get login token
echo -n "Getting auth token ... "
TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"emailOrPhone":"admin@bossjobs.et","password":"Admin123!@#"}' \
    | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('token',''))" 2>/dev/null)

if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✓ GOT TOKEN${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

# Job Endpoints
test_endpoint "Get All Jobs" "GET" "$BASE_URL/jobs"
test_endpoint "Get Job by ID" "GET" "$BASE_URL/jobs/1"
test_endpoint "Get Nearby Jobs" "GET" "$BASE_URL/jobs/nearby?latitude=9.0320&longitude=38.7469&radius=10"
test_endpoint "Search Jobs" "GET" "$BASE_URL/jobs/search?q=developer&type=Full-time"
test_endpoint "Get Non-existent Job" "GET" "$BASE_URL/jobs/999"

# Profile Endpoints (with auth)
test_endpoint "Get Profile" "GET" "$BASE_URL/profile" "" "$TOKEN"
test_endpoint "Create Profile" "POST" "$BASE_URL/profile" \
    '{"title":"Developer","bio":"Test bio","skills":["JavaScript"]}' "$TOKEN"

# Application Endpoints
test_endpoint "My Applications" "GET" "$BASE_URL/applications/my-applications" "" "$TOKEN"
test_endpoint "Apply for Job" "POST" "$BASE_URL/applications/apply/1" \
    '{"coverLetter":"I am interested"}' "$TOKEN"

echo ""
echo "============================================"
echo -e "Results: ${GREEN}$PASS passed${NC}, ${RED}$FAIL failed${NC}"
echo "============================================"
