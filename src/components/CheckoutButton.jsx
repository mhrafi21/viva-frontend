
import React, { useState } from 'react';
import axios from 'axios';
// https://viva-65dt.onrender.com
const CheckoutButton = () => {
  
  const [paymentUrl, setPaymentUrl] = useState('');

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5173/api/create-payment', {
        amount: 50,
        customerEmail: "Rafi@gmail.com  ",
        customerName: "Rafi"
      });
      setPaymentUrl(response.data.paymentUrl);
      window.location.href = response.data.paymentUrl; // Redirect to Smart Checkout
    } catch (error) {
      console.error('Payment initiation failed:', error.response?.data || error.message);
      alert('Failed to initiate payment');
    }
  };

  return (
    <div>
      <h2>Initiate Payment</h2>
    <button onClick={handlePayment}>Payment now</button>
      {paymentUrl && <p>Redirecting to payment page...</p>}
    </div>
  );
};

export default CheckoutButton;
