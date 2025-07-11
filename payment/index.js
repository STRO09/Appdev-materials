// index.js
require('dotenv').config(); 
const express = require('express');
const axios = require('axios');
const cors = require('cors');


const app = express();
app.use(cors());
app.use(express.json());

app.post('/create-session', async (req, res) => {
  const headers = {
  'x-client-id': process.env.CASHFREE_CLIENT_ID,
  'x-client-secret': process.env.CASHFREE_CLIENT_SECRET,
    'x-api-version': '2022-09-01',
    'Content-Type': 'application/json',
  };

  const data = {
    order_id: "order_" + Date.now(), // ✅ unique order ID
    order_amount: 1.00,
    order_currency: "INR",
    order_note: "Test payment",
    customer_details: {               // ✅ CORRECT structure
      customer_id: "user123",
      customer_email: "test@example.com",
      customer_phone: "9699432854"
    },
    order_meta: {
      return_url: "http://localhost:5500/success.html?order_id={order_id}",
    }
  };

  try {
    const response = await axios.post(
      'https://sandbox.cashfree.com/pg/orders',
      data,
      { headers }
    );
    res.json({ sessionId: response.data.payment_session_id });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to create session" });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
