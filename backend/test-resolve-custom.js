const axios = require('axios');
async function test() {
  try {
    const res = await axios.get('https://bktp1.onrender.com/api/booking-links/resolve?token=439fedb565c75cce7c7655cdc71134dfe48e4356cbde7e3dbd81534c0054ad50');
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error Status:', err.response?.status);
    console.error('Error Data:', err.response?.data);
  }
}
test();
