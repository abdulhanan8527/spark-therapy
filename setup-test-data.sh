#!/bin/bash
# Test Data Setup Script for SPARKTherapy

echo "🧪 Setting up test data for SPARKTherapy application..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test credentials
ADMIN_EMAIL="admin@test.com"
ADMIN_PASS="AdminPass123!"
PARENT_EMAIL="parent@test.com"
PARENT_PASS="ParentPass123!"
THERAPIST_EMAIL="therapist@test.com"
THERAPIST_PASS="TherapistPass123!"

echo -e "${BLUE}Creating test users...${NC}"

# Register admin user
echo -e "${YELLOW}Creating admin user...${NC}"
curl -s -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Admin",
    "email": "'$ADMIN_EMAIL'",
    "password": "'$ADMIN_PASS'",
    "role": "admin"
  }' | jq '.'

# Register parent user
echo -e "${YELLOW}Creating parent user...${NC}"
curl -s -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Parent",
    "email": "'$PARENT_EMAIL'",
    "password": "'$PARENT_PASS'",
    "role": "parent"
  }' | jq '.'

# Register therapist user
echo -e "${YELLOW}Creating therapist user...${NC}"
curl -s -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Therapist",
    "email": "'$THERAPIST_EMAIL'",
    "password": "'$THERAPIST_PASS'",
    "role": "therapist"
  }' | jq '.'

echo -e "${GREEN}Test users created successfully!${NC}"
echo ""
echo -e "${BLUE}Test Credentials:${NC}"
echo "Admin: $ADMIN_EMAIL / $ADMIN_PASS"
echo "Parent: $PARENT_EMAIL / $PARENT_PASS" 
echo "Therapist: $THERAPIST_EMAIL / $THERAPIST_PASS"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Login to the web app with these credentials"
echo "2. Test the child creation functionality"
echo "3. Test session scheduling"
echo "4. Verify all dropdowns are working"