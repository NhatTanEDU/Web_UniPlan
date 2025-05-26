const axios = require('axios');

// Replace with your actual backend URL
const BASE_URL = 'http://localhost:5000/api/auth';
async function bulkRegisterAndLogin() {
    const users = [
        { name: 'User1', email: 'user1@example.com', password: 'password1' },
        { name: 'User2', email: 'user2@example.com', password: 'password2' },
        { name: 'User3', email: 'user3@example.com', password: 'password3' },
        { name: 'User4', email: 'user4@example.com', password: 'password4' }
    ];

    console.log('--- Bulk Registration ---');
    for (const user of users) {
        try {
            const registerResponse = await axios.post(`${BASE_URL}/register`, user);
            console.log(`Registered: ${user.email} with password: ${user.password}`);
        } catch (error) {
            console.error(`Failed to register ${user.email}:`, error.response?.data || error.message);
        }
    }

    console.log('\n--- Bulk Login ---');
    for (const user of users) {
        try {
            const loginResponse = await axios.post(`${BASE_URL}/login`, {
                email: user.email,
                password: user.password
            });
            const { token, email, name, createdAt } = loginResponse.data;
            console.log(`Login successful for ${email}`);
            console.log(`Token: ${token}`);
            console.log(`Name: ${name}`);
            console.log(`Created At: ${createdAt}`);
        } catch (error) {
            console.error(`Failed to login ${user.email}:`, error.response?.data || error.message);
        }
    }
}

bulkRegisterAndLogin();
