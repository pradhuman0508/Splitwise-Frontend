// Test script for the Splitwise Backend API
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testAPI() {
  console.log('🧪 Testing Splitwise Backend API...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health check...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    console.log('');

    // Test 2: Get UID by email
    console.log('2️⃣ Testing UID lookup for yash0098209295@gmail.com...');
    const uidResponse = await axios.get(`${API_BASE}/users/uid-by-email`, {
      params: { email: 'yash0098209295@gmail.com' }
    });
    console.log('✅ UID lookup successful:', uidResponse.data);
    console.log('');

    // Test 3: Get UID for bakadiyayash@gmail.com
    console.log('3️⃣ Testing UID lookup for bakadiyayash@gmail.com...');
    try {
      const uidResponse2 = await axios.get(`${API_BASE}/users/uid-by-email`, {
        params: { email: 'bakadiyayash@gmail.com' }
      });
      console.log('✅ UID lookup successful:', uidResponse2.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('❌ User not found (expected if not registered):', error.response.data);
      } else {
        console.log('❌ Error:', error.message);
      }
    }
    console.log('');

    // Test 4: Get multiple UIDs
    console.log('4️⃣ Testing batch UID lookup...');
    const batchResponse = await axios.post(`${API_BASE}/users/uid-by-emails`, {
      emails: ['yash0098209295@gmail.com', 'bakadiyayash@gmail.com']
    });
    console.log('✅ Batch UID lookup successful:', batchResponse.data);
    console.log('');

    // Test 5: List all users (first 10)
    console.log('5️⃣ Testing list all users (first 10)...');
    const allUsersResponse = await axios.get(`${API_BASE}/users/all?maxResults=10`);
    console.log('✅ List users successful:');
    console.log(`   Found ${allUsersResponse.data.users.length} users`);
    allUsersResponse.data.users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.uid})`);
    });

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

// Run the test
testAPI();
