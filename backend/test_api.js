const axios = require('axios');

async function check() {
  try {
    const res = await axios.get('http://localhost:3001/api/trips?status=all');
    console.log('Status:', res.status);
    console.log('Count:', res.data.count);
    console.log('Data Length:', res.data.data.length);
    console.log('First Trip:', res.data.data[0]?.title);
  } catch (err) {
    console.error('Error calling API:', err.message);
    if (err.response) console.log('Response:', err.response.data);
  }
}

check();
