import React from "react";

function CheckoutButton() {
  const handlePayment = async () => {
    try {
      const response = await fetch("https://viva-65dt.onrender.com/api/viva/create-order", {
        method: "POST",
      });

      const data = await response.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        alert("Payment creation failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Viva ISV Payment (MERN)</h1>
      <button onClick={handlePayment}>Pay Now</button>
    </div>
  );
}

export default CheckoutButton;
