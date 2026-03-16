#!/bin/bash

echo "🧪 Testing React Router Implementation"
echo "====================================="

# Test 1: Check if React dev server is running
echo "📍 Test 1: Checking React dev server..."
if curl -s http://localhost:3002 > /dev/null; then
    echo "✅ React dev server is running on port 3002"
else
    echo "❌ React dev server is not running"
    exit 1
fi

# Test 2: Test login page loads
echo "📍 Test 2: Testing login page..."
login_page=$(curl -s http://localhost:3002/login)
if echo "$login_page" | grep -q "Sign in\|login"; then
    echo "✅ Login page loads correctly"
else
    echo "❌ Login page not loading properly"
fi

# Test 3: Test register page loads
echo "📍 Test 3: Testing register page..."
register_page=$(curl -s http://localhost:3002/register)
if echo "$register_page" | grep -q "register\|Sign up"; then
    echo "✅ Register page loads correctly"
else
    echo "❌ Register page not loading properly"
fi

# Test 4: Test that /dashboard route is removed (should redirect)
echo "📍 Test 4: Testing /dashboard route removal..."
dashboard_response=$(curl -s -I http://localhost:3002/dashboard | head -1)
if echo "$dashboard_response" | grep -q "302\|301"; then
    echo "✅ /dashboard route properly redirects"
else
    echo "❌ /dashboard route still accessible or not redirecting"
fi

# Test 5: Test that role routes exist (should redirect to login when not authenticated)
echo "📍 Test 5: Testing role routes redirect to login..."
patient_response=$(curl -s -I http://localhost:3002/patient | head -1)
admin_response=$(curl -s -I http://localhost:3002/admin | head -1)
super_response=$(curl -s -I http://localhost:3002/super | head -1)

if echo "$patient_response" | grep -q "302\|301" && \
   echo "$admin_response" | grep -q "302\|301" && \
   echo "$super_response" | grep -q "302\|301"; then
    echo "✅ All role routes properly redirect to login when not authenticated"
else
    echo "❌ Some role routes not redirecting properly"
fi

echo ""
echo "🎉 Router Tests Complete!"
echo "🌐 React Website: http://localhost:3002"
echo ""
echo "📋 Manual Testing Checklist:"
echo "1. Open http://localhost:3002 in browser"
echo "2. Verify login page loads"
echo "3. Try accessing /dashboard - should redirect"
echo "4. Try accessing /patient - should redirect to login"
echo "5. Try accessing /admin - should redirect to login" 
echo "6. Try accessing /super - should redirect to login"
echo "7. Login with test credentials:"
echo "   - super@meditrack.com → should redirect to /super"
echo "   - admin@meditrack.com → should redirect to /admin"
echo "   - patient account → should redirect to /patient"
echo "8. Verify dashboards load with content (not blank)"
echo "9. Test navigation between routes"
echo "10. Verify settings and ticket routes work"
