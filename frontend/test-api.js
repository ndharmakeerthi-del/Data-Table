import axios from 'axios';

async function testAPI() {
    try {
        console.log('Testing user API endpoint...');
        const response = await axios.get('http://localhost:3000/api/users?page=1&limit=10');
        console.log('Response status:', response.status);
        console.log('Response data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testAPI();