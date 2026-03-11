
import axios from 'axios';

async function testBackendLogin() {
    console.log('--- TESTING BACKEND LOGIN ---');
    try {
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@neuratrade.com',
            password: 'Admin@123'
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));
    } catch (error: any) {
        console.error('Login Failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error Message:', error.message);
        }
    }
}

testBackendLogin();
