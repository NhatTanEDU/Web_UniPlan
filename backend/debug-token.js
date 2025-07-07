const jwt = require('jsonwebtoken');
require('dotenv').config();

// Test script to debug token issues
console.log('JWT_SECRET from env:', process.env.JWT_SECRET);
console.log('JWT_EXPIRES_IN from env:', process.env.JWT_EXPIRES_IN);

// Test token creation
const testPayload = {
  id: '6775ee5b5eded6ab19b89720', // Your actual user ID
  email: 'tanmoi@example2.com'
};

const testToken = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
console.log('\nGenerated test token:', testToken);

// Test token verification
try {
  const decoded = jwt.verify(testToken, process.env.JWT_SECRET);
  console.log('\nDecoded payload:', decoded);
  console.log('ID type:', typeof decoded.id);
  console.log('ID value:', decoded.id);
} catch (error) {
  console.error('Token verification failed:', error.message);
}

// If you have a token from Postman, paste it here to test
const yourPostmanToken = 'PASTE_YOUR_TOKEN_HERE';
if (yourPostmanToken !== 'PASTE_YOUR_TOKEN_HERE') {
  console.log('\n--- Testing your Postman token ---');
  try {
    const decoded = jwt.verify(yourPostmanToken, process.env.JWT_SECRET);
    console.log('Your token is valid!');
    console.log('Decoded payload:', decoded);
  } catch (error) {
    console.error('Your token verification failed:', error.message);
  }
}
