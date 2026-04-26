const axios = require('axios');

async function testAnalytics() {
  try {
    // First, login to get a token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'aeros@gmail.com', // approved company
      password: 'password123'
    });

    const token = loginResponse.data.token;
    console.log('Logged in, token:', token ? 'received' : 'not received');

    // Now call analytics
    const analyticsResponse = await axios.get('http://localhost:5000/api/analytics/rapport', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Analytics response:', JSON.stringify(analyticsResponse.data, null, 2));
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testAnalytics();