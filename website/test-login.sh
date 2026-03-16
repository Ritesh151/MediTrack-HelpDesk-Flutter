#!/bin/bash

echo "🔐 REACT LOGIN SYSTEM TESTING"
echo "============================"

# Test 1: Check if React dev server is running
echo "📍 Test 1: Checking React dev server..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ React dev server is running on port 3000"
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

# Test 3: Test Super Admin login
echo "📍 Test 3: Testing Super Admin login..."
super_response=$(curl -s -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"super@meditrack.com","password":"super123"}')

if echo "$super_response" | grep -q '"token"'; then
    echo "✅ Super Admin login API working"
    super_token=$(echo "$super_response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    super_role=$(echo "$super_response" | grep -o '"role":"[^"]*' | cut -d'"' -f4)
    echo "   Role: $super_role"
else
    echo "❌ Super Admin login API failed"
    echo "   Response: $super_response"
fi

# Test 4: Test Admin login
echo "📍 Test 4: Testing Admin login..."
admin_response=$(curl -s -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@meditrack.com","password":"admin123"}')

if echo "$admin_response" | grep -q '"token"'; then
    echo "✅ Admin login API working"
    admin_token=$(echo "$admin_response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    admin_role=$(echo "$admin_response" | grep -o '"role":"[^"]*' | cut -d'"' -f4)
    echo "   Role: $admin_role"
else
    echo "❌ Admin login API failed"
    echo "   Response: $admin_response"
fi

# Test 5: Test invalid credentials
echo "📍 Test 5: Testing invalid credentials..."
invalid_response=$(curl -s -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"invalid@test.com","password":"wrongpassword"}')

if echo "$invalid_response" | grep -q "error\|Invalid\|Wrong"; then
    echo "✅ Invalid credentials properly rejected"
else
    echo "❌ Invalid credentials not handled properly"
    echo "   Response: $invalid_response"
fi

echo ""
echo "🎉 LOGIN API TESTS COMPLETE!"
echo ""
echo "🌐 ACCESS POINTS:"
echo "   React Website: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo ""
echo "📋 MANUAL TESTING CHECKLIST:"
echo ""
echo "🔐 LOGIN FUNCTIONALITY:"
echo "1. Open http://localhost:3000 in browser"
echo "2. Should see splash screen then redirect to login"
echo "3. Test Super Admin login:"
echo "   - Email: super@meditrack.com"
echo "   - Password: super123"
echo "   - Should redirect to /super"
echo ""
echo "4. Test Admin login:"
echo "   - Email: admin@meditrack.com"
echo "   - Password: admin123"
echo "   - Should redirect to /admin"
echo ""
echo "5. Test invalid login:"
echo "   - Wrong email/password"
echo "   - Should show error message"
echo ""
echo "6. Test demo account buttons:"
echo "   - Click demo account buttons"
echo "   - Should auto-fill credentials"
echo ""
echo "7. Test form validation:"
echo "   - Empty fields should be rejected"
echo "   - Invalid email format should show error"
echo ""
echo "8. Test token storage:"
echo "   - After successful login, check localStorage"
echo "   - Should contain 'token', 'user', 'role'"
echo ""
echo "9. Test role-based redirect:"
echo "   - super@meditrack.com → /super"
echo "   - admin@meditrack.com → /admin"
echo "   - patient accounts → /patient"
echo ""
echo "10. Test logout functionality:"
echo "    - Click logout button"
echo "    - Should clear localStorage and redirect to login"
echo ""
echo "11. Test auto-login:"
echo "    - Refresh page after login"
echo "    - Should stay logged in (token persistence)"
echo ""
echo "12. Test API authentication:"
echo "    - After login, API calls should include Authorization header"
echo "    - Should be able to access protected endpoints"
echo ""
echo "🎯 SUCCESS CRITERIA:"
echo "✅ All login accounts work"
echo "✅ Role-based redirects working"
echo "✅ Error messages displayed"
echo "✅ Token storage working"
echo "✅ API authentication working"
echo "✅ No console errors"
echo "✅ Smooth user experience"
