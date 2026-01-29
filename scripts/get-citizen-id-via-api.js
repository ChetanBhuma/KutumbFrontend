const axios = require('axios');
const BASE_URL = 'http://localhost:5000/api/v1';

async function main() {
    try {
        console.log('Logging in as Admin...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            identifier: 'admin@delhipolice.gov.in',
            password: 'Admin@123'
        });

        const token = loginRes.data.data.tokens.accessToken;
        console.log('Admin Logged In.');

        console.log('Fetching Citizens...');
        const citizensRes = await axios.get(`${BASE_URL}/citizens`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const citizens = citizensRes.data.data.citizens; // Assuming limit/page structure
        console.log(`Found ${citizens.length} citizens.`);

        if (citizens.length > 0) {
            console.log('\n==========================================');
            console.log(`👤 FOUND CITIZEN ID: ${citizens[0].id}`);
            console.log('==========================================\n');
        } else {
            console.log('No citizens found in DB.');
        }

    } catch (e) {
        console.error('FAILED:', e.response?.data || e.message);
    }
}
main();
