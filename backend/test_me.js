const axios = require('axios');

async function test() {
  try {
    const res = await axios.get('http://localhost:3001/api/admin/me');
    console.log('Status:', res.status);
    console.log('Data:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
    if (err.response) {
      console.error('Response:', err.response.data);
    }
  }
}

test();
