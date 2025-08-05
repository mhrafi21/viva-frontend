import React, { useState } from 'react';

// import axios from "axios";

const CheckoutButton = () => {
const [loading, setLoading] = useState(false);

 const handlePay = async () => {
    setLoading(true);

    try {
      const response = await fetch('https://viva-65dt.onrender.com/create-payment-intent', {
        method: 'POST',
         headers: {
          'Content-Type': 'application/json',
        },
         body: JSON.stringify({
          amount: 1000, // amount in cents or minor units
         customerEmail: 'test@example.com',
        }),
       });

      const data = await response.json();

      if (data?.redirectUrl) {
        // Redirect to Viva Wallet payment page
        window.location.href = data.redirectUrl;
      } else {
        alert('Failed to create payment');
      }
    } catch (error) {
     console.error('Payment Error:', error);
      alert('Something went wrong');
  } finally {
    setLoading(false);
   }
 };

 return (
   <div className="p-6">
     <h2 className="text-lg font-bold mb-4">Make a Payment</h2>
     <button
        onClick={handlePay}
       disabled={loading}
       className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
     >
       {loading ? 'Redirecting...' : 'Pay Now'}
      </button>
    </div>
  );
 };

export default CheckoutButton;

// function CheckoutButton() {
//   const handlePayment = async () => {
//     try {
//       const response = await axios.post('https://viva-65dt.onrender.com/create-payment', {
//         amount: 20.0,
//         customerEmail: 'customer@example.com',
//       });

//       const { redirectUrl } = response.data;
//       window.location.href = redirectUrl;
//     } catch (err) {
//       console.error('Payment error:', err);
//     }
//   };

//   return (
//     <div style={{ padding: 40 }}>
//       <h1>Viva Wallet ISV Smart Checkout</h1>
//       <button onClick={handlePayment}>Pay £20</button>
//     </div>
//   );
// }

// export default CheckoutButton;
