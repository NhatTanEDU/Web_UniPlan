// Debug script to check environment variables during build
console.log('🔍 Environment Variables Debug:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('CI:', process.env.CI);
console.log('GENERATE_SOURCEMAP:', process.env.GENERATE_SOURCEMAP);

console.log('\n📋 All environment variables:');
Object.keys(process.env)
  .sort()
  .forEach(key => {
    if (key.startsWith('REACT_APP_') || ['NODE_ENV', 'CI', 'GENERATE_SOURCEMAP'].includes(key)) {
      console.log(`${key}:`, process.env[key]);
    }
  });

console.log('\n🎯 Expected values:');
console.log('REACT_APP_API_URL: https://web-production-61868.up.railway.app/api');
console.log('NODE_ENV: production');

console.log('\n⚠️  Note: If REACT_APP_API_URL is undefined, using runtime detection fallback');
