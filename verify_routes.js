const fetch = require('node-fetch');

async function test() {
    try {
        const res = await fetch('http://localhost:3000/api/health');
        const data = await res.json();
        console.log('Health check:', data);

        const resUsers = await fetch('http://localhost:3000/api/admin/users');
        console.log('Admin Users status:', resUsers.status); // Should be 401 without token
    } catch (e) {
        console.error('Fetch error:', e.message);
    }
}
test();
