// Simple script to test token-based authentication

const axios = require('axios');
const url = process.argv[2] || 'https://web-production-98a8b.up.railway.app';

async function testTokenAuth() {
  console.log(`Testing token-based authentication on ${url}`);
  
  try {
    // Create an axios instance
    const api = axios.create({
      baseURL: url
    });
    
    // Try to login and get a token
    console.log('Attempting to login and get token...');
    const loginResponse = await api.post('/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('Login response status:', loginResponse.status);
    
    // Check if we got a token
    const token = loginResponse.data.token;
    if (token) {
      console.log('Token received successfully:', token.substring(0, 20) + '...');
      
      // Try to access a protected route using the token
      console.log('\nAttempting to access protected route with token...');
      const checkResponse = await api.get('/api/auth/check', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Check response status:', checkResponse.status);
      console.log('User data:', checkResponse.data);
      
      console.log('\nToken-based authentication test completed successfully');
    } else {
      console.log('No token received in response');
      console.log('Response data:', loginResponse.data);
    }
  } catch (error) {
    console.error('Error during authentication test:');
    console.error('Status:', error.response?.status);
    console.error('Status text:', error.response?.statusText);
    console.error('Data:', error.response?.data);
    
    if (error.response?.status === 401) {
      console.error('\nAuthentication failed with 401 Unauthorized');
      console.error('This suggests a problem with token verification');
    }
  }
}

testTokenAuth();
