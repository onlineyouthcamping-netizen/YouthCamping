const axios = require('axios');
async function test() {
  try {
    const res = await axios.get('https://bktp1.onrender.com/api/booking-links/resolve?token=c026c4abc086bc0e6bf017b4016240b8123db0db93f21eab86d35a5353e7ca73');
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error Status:', err.response?.status);
    console.error('Error Data:', err.response?.data);
  }
}
test();
