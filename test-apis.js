// Simple API test script
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPIs() {
  console.log('🧪 Testing StudyBuddy APIs...\n');

  const tests = [
    {
      name: 'Discover Resources API',
      url: '/api/discover/resources',
      method: 'GET',
      params: { subject: 'Mathematics', academicLevel: 'Beginner' }
    },
    {
      name: 'Groups List API',
      url: '/api/groups/list',
      method: 'GET',
      params: { subject: 'Physics' }
    },
    {
      name: 'Users Me API (Unauthorized)',
      url: '/api/users/me',
      method: 'GET'
    },
    {
      name: 'Groups User API (Unauthorized)',
      url: '/api/groups/user',
      method: 'GET'
    },
    {
      name: 'Requests Pending API (Unauthorized)',
      url: '/api/requests/pending',
      method: 'GET'
    },
    {
      name: 'Chats User API (Unauthorized)',
      url: '/api/chats/user',
      method: 'GET'
    },
    {
      name: 'Resources Matchmaking API (Unauthorized)',
      url: '/api/resources/matchmaking',
      method: 'GET'
    }
  ];

  for (const test of tests) {
    try {
      console.log(`📡 Testing: ${test.name}`);
      
      const response = await axios({
        method: test.method,
        url: `${BASE_URL}${test.url}`,
        params: test.params,
        timeout: 5000
      });

      console.log(`✅ Success: ${test.name}`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Data: ${Array.isArray(response.data) ? `${response.data.length} items` : 'Object'}`);
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log(`   Sample: ${JSON.stringify(response.data[0], null, 2).substring(0, 200)}...`);
      }
      
    } catch (error) {
      console.log(`❌ Failed: ${test.name}`);
      console.log(`   Status: ${error.response?.status || 'No response'}`);
      console.log(`   Error: ${error.response?.data?.error || error.message}`);
    }
    
    console.log('');
  }

  console.log('🏁 API testing completed!');
}

// Run the tests
testAPIs().catch(console.error); 