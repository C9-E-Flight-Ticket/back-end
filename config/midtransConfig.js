const midtrans = require('midtrans-client');

const snap = new midtrans.Snap({
  isProduction: false, 
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

module.exports = snap;