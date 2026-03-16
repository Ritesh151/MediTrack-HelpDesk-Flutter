#!/bin/bash

echo "🧪 Testing React Website - MediTrack HelpDesk"
echo "=========================================="

# Test 1: Check if React dev server is running
echo "📍 Test 1: Checking React dev server..."
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ React dev server is running on port 3001"
else
    echo "❌ React dev server is not running"
    exit 1
fi

# Test 2: Check if backend API is running
echo "📍 Test 2: Checking backend API..."
if curl -s http://localhost:5000/api/tickets > /dev/null; then
    echo "✅ Backend API is running on port 5000"
else
    echo "❌ Backend API is not responding"
    exit 1
fi

# Test 3: Test login endpoint (should fail without credentials)
echo "📍 Test 3: Testing login endpoint..."
login_response=$(curl -s -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrongpassword"}')

if echo "$login_response" | grep -q "error\|Invalid\|Wrong"; then
    echo "✅ Login endpoint working (correctly rejects invalid credentials)"
else
    echo "❌ Login endpoint not working properly"
    echo "Response: $login_response"
fi

# Test 4: Test hospitals endpoint (should fail without auth)
echo "📍 Test 4: Testing hospitals endpoint..."
hospitals_response=$(curl -s http://localhost:5000/api/hospitals)
if echo "$hospitals_response" | grep -q "Not authorized\|NO_TOKEN"; then
    echo "✅ Hospitals endpoint working (correctly requires authentication)"
else
    echo "❌ Hospitals endpoint not working properly"
    echo "Response: $hospitals_response"
fi

# Test 5: Test register endpoint
echo "📍 Test 5: Testing register endpoint..."
register_response=$(curl -s -X POST http://localhost:5000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"name":"Test User","email":"test$(date +%s)@example.com","password":"test123","role":"patient"}')

if echo "$register_response" | grep -q "token\|success\|created"; then
    echo "✅ Register endpoint working"
else
    echo "❌ Register endpoint not working properly"
    echo "Response: $register_response"
fi

echo ""
echo "🎉 API Tests Complete!"
echo "🌐 React Website: http://localhost:3001"
echo "🔧 Backend API: http://localhost:5000"
echo ""
echo "📋 Manual Testing Checklist:"
echo "1. Open http://localhost:3001 in browser"
echo "2. Test user registration"
echo "3. Test user login with different roles (patient, admin, super)"
echo "4. Verify role-based redirects work"
echo "5. Test ticket creation as patient"
echo "6. Test ticket management as admin"
echo "7. Test hospital management"
echo "8. Test dashboard statistics"
echo "9. Test chat/messaging functionality"
echo "10. Test settings page"
