// Simple script to test authentication and cookie handling

const axios = require('axios');
const url = process.argv[2] || 'https://web-production-98a8b.up.railway.app';

async function testAuth() {
  console.log(`Testing authentication on ${url}`);
  
  try {
    // Create an axios instance with cookie support
    const api = axios.create({
      baseURL: url,
      withCredentials: true
    });
    
    // Try to login
    console.log('Attempting to login...');
    const loginResponse = await api.post('/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('Login response status:', loginResponse.status);
    console.log('Login response headers:', loginResponse.headers);
    console.log('Set-Cookie header:', loginResponse.headers['set-cookie']);
    
    // Check if we got a cookie
    if (loginResponse.headers['set-cookie']) {
      console.log('Cookie received successfully');
    } else {
      console.log('No cookie received');
    }
    
    // Try to access a protected route
    console.log('\nAttempting to access protected route...');
    const checkResponse = await api.get('/api/auth/check');
    
    console.log('Check response status:', checkResponse.status);
    console.log('User data:', checkResponse.data);
    
    console.log('\nAuthentication test completed successfully');
  } catch (error) {
    console.error('Error during authentication test:');
    console.error('Status:', error.response?.status);
    console.error('Status text:', error.response?.statusText);
    console.error('Data:', error.response?.data);
    console.error('Headers:', error.response?.headers);
    
    if (error.response?.status === 401) {
      console.error('\nAuthentication failed with 401 Unauthorized');
      console.error('This suggests a problem with cookie handling or JWT verification');
    }
  }
}

testAuth();
