/**
 * Boss Jobs Ethiopia - API Test Suite
 * Run: node test-api.js
 */

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Boss Jobs Ethiopia API Test\n');
  console.log('=' .repeat(50));
  
  let token = '';
  let jobId = 1;
  
  // Test 1: Health Check
  console.log('\n1️⃣ Health Check');
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    console.log('   ✅', data.message);
  } catch (e) {
    console.log('   ❌ Server not running! Start with: npm run dev');
    return;
  }
  
  // Test 2: Login
  console.log('\n2️⃣ Login');
  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailOrPhone: 'admin@bossjobs.et',
        password: 'Admin123!@#',
      }),
    });
    const data = await res.json();
    if (data.success) {
      token = data.data.token;
      console.log('   ✅ Login successful');
      console.log('   Token:', token.substring(0, 50) + '...');
    } else {
      console.log('   ⚠️ ', data.message);
    }
  } catch (e) {
    console.log('   ❌ Error:', e.message);
  }
  
  // Test 3: Get Jobs
  console.log('\n3️⃣ Get All Jobs');
  try {
    const res = await fetch(`${BASE_URL}/api/v1/jobs`);
    const data = await res.json();
    if (data.success) {
      console.log(`   ✅ Found ${data.count || data.data?.length || 0} jobs`);
      if (data.data && data.data[0]) {
        jobId = data.data[0].id;
      }
    }
  } catch (e) {
    console.log('   ❌ Error:', e.message);
  }
  
  // Test 4: Search Jobs
  console.log('\n4️⃣ Search Jobs');
  try {
    const res = await fetch(`${BASE_URL}/api/v1/jobs/search?q=developer`);
    const data = await res.json();
    console.log(`   ✅ Found ${data.data?.length || 0} matching jobs`);
  } catch (e) {
    console.log('   ❌ Error:', e.message);
  }
  
  // Test 5: Get Nearby Jobs
  console.log('\n5️⃣ Nearby Jobs');
  try {
    const res = await fetch(`${BASE_URL}/api/v1/jobs/nearby?latitude=9.0320&longitude=38.7469&radius=10`);
    const data = await res.json();
    console.log(`   ✅ Found ${data.data?.jobs?.length || 0} nearby jobs`);
  } catch (e) {
    console.log('   ❌ Error:', e.message);
  }
  
  // Test 6: Dashboard
  if (token) {
    console.log('\n6️⃣ Dashboard (Admin)');
    try {
      const res = await fetch(`${BASE_URL}/api/v1/dashboard/platform`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        console.log('   ✅ Dashboard stats:', data.data.statistics);
      }
    } catch (e) {
      console.log('   ❌ Error:', e.message);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Tests completed!');
  console.log('\n📚 Visit http://localhost:3000 for the dashboard');
  console.log('📚 Visit http://localhost:3000/api/v1 for API docs\n');
}

testAPI();
