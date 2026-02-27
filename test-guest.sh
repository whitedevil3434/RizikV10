#!/bin/bash
# Guest Endpoint Guessing
curl -X POST "https://api.puter.com/guest" -H "Content-Type: application/json" -d '{}'
echo ""
curl -X POST "https://api.puter.com/v1/auth/guest" -H "Content-Type: application/json" -d '{}'
echo ""
curl -X POST "https://api.puter.com/users/guest" -H "Content-Type: application/json" -d '{}'
echo ""
curl -X POST "https://api.puter.com/auth/guest" -H "Content-Type: application/json" -d '{}'
echo ""
# Maybe plain GET?
curl "https://api.puter.com/guest"
echo ""
