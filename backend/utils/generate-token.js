// utils/generate-token.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const payload = {
  id: '681ba7ecff8ba2947dc8e5b7',
  email: 'tanmoi@example2.com',
};

const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
console.log('New token:', token);