// Test frontend với token hết hạn
console.log('🧪 Testing frontend with expired token...');

// Set token hết hạn vào localStorage để test interceptor
const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NjU5NzE0OTM5NGE3MTU5MDQzN2E3NCIsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzM0NzY1NjU1LCJleHAiOjE3MzQ4NTIwNTV9.f6HFKgYAcyh6IG0FRGZ7OJEgvxGl4SnJhMKv7PGcTAE';

localStorage.setItem('token', expiredToken);

console.log('✅ Set expired token in localStorage');
console.log('🔄 Now refresh the page or make an API call to see interceptor in action');

// Test gọi API để trigger interceptor
fetch('http://localhost:5000/api/subscription/status', {
    headers: {
        'Authorization': `Bearer ${expiredToken}`,
        'Content-Type': 'application/json'
    }
})
.then(response => {
    console.log('📡 API Response:', response.status, response.statusText);
    return response.json();
})
.then(data => {
    console.log('📄 Response data:', data);
})
.catch(error => {
    console.log('❌ API Error:', error);
});
