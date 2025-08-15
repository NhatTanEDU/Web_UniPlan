// Debug script to check environment variables during build
console.log('🔍 Environment Variables Debug:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('All REACT_APP_ variables:');

Object.keys(process.env)
  .filter(key => key.startsWith('REACT_APP_'))
  .forEach(key => {
    console.log(`${key}:`, process.env[key]);
  });

console.log('🎯 Expected API URL: https://web-production-61868.up.railway.app/api');
