// Test script to verify authentication fixes
const axios = require('axios');

// Get the URL from command line or use default
const url = process.argv[2] || 'https://web-production-98a8b.up.railway.app';

async function testAuthFix() {
  console.log(`Testing authentication fixes on ${url}`);
  
  try {
    // Create an axios instance with credentials enabled
    const api = axios.create({
      baseURL: url,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    // Step 1: Try to login and get a token
    console.log('\n1. Attempting to login and get token...');
    const loginResponse = await api.post('/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('Login response status:', loginResponse.status);
    
    // Check if we got a token
    const token = loginResponse.data.token;
    if (token) {
      console.log('Token received successfully:', token.substring(0, 20) + '...');
      
      // Set the token in the Authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Step 2: Try to access a protected route using the token
      console.log('\n2. Attempting to access protected route with token...');
      const checkResponse = await api.get('/api/auth/check');
      
      console.log('Check response status:', checkResponse.status);
      console.log('User data:', checkResponse.data);
      
      // Step 3: Check for cookies
      console.log('\n3. Checking for cookies in response headers...');
      console.log('Set-Cookie header:', loginResponse.headers['set-cookie'] ? 'Present' : 'Not present');
      
      console.log('\nAuthentication test completed successfully');
    } else {
      console.log('No token received in response');
      console.log('Response data:', loginResponse.data);
    }
  } catch (error) {
    console.error('Error during authentication test:');
    console.error('Status:', error.response?.status);
    console.error('Status text:', error.response?.statusText);
    console.error('Data:', error.response?.data);
    console.error('Headers:', error.response?.headers);
    console.error('Message:', error.message);
  }
}

testAuthFix();
