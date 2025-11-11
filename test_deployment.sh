#!/bin/bash
echo "=== Testing Cannabis Fantasy League Deployment ==="
echo ""

echo "1. Testing Homepage..."
curl -s -o /dev/null -w "Status: %{http_code}\n" https://cannabis-fantasy-league.onrender.com
echo ""

echo "2. Testing Login Endpoint..."
LOGIN_RESPONSE=$(curl -s -X POST https://cannabis-fantasy-league.onrender.com/api/auth/mock-login \
  -H "Content-Type: application/json" \
  -d '{"username": "TestUser"}')
echo "$LOGIN_RESPONSE" | python3 -m json.tool
echo ""

echo "3. Testing Health Check..."
curl -s https://cannabis-fantasy-league.onrender.com/api/health | python3 -m json.tool
echo ""

echo "4. Testing Database Connection..."
echo "Tables in database:"
PGPASSWORD="dNLH1zYnvPJ8HjMZxUvmZ0YBZ6CNv27d" psql -h dpg-d483rrchg0os7381fqjg-a.oregon-postgres.render.com -U weedexchange_user -d weedexchange -c "\dt" -t | wc -l
echo ""

echo "5. Testing User Count..."
PGPASSWORD="dNLH1zYnvPJ8HjMZxUvmZ0YBZ6CNv27d" psql -h dpg-d483rrchg0os7381fqjg-a.oregon-postgres.render.com -U weedexchange_user -d weedexchange -c "SELECT COUNT(*) FROM users;" -t
echo ""

echo "=== All Tests Complete ==="
