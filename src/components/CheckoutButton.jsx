import axios from "axios"
function App() {

  const handlePayment = async () => {
    const res = await axios.post("https://viva-65dt.onrender.com/api/payment", {
      amount: 10, // 10 EUR
      customerEmail: "customerEmail@gmail.com",
    });
    window.location.href = res.data.redirectUrl;
  };

  return (
    <div>
      <h1>Buy Now</h1>
      <button onClick={handlePayment} className="border-green-600">Pay with Viva Wallet</button>
    </div>
  );
}

export default App;