import { CheckCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useState } from 'react';
import {useSearchParams} from "react-router"
import axios from "axios"
const PayLaterSuccess = ({ redirectUrl = "https://maloncho.foodpos.io" }) => {
  const handleBackToHome = () => {
    window.location.href = redirectUrl;
  };

   const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("Checking payment...");
  const orderCode = searchParams.get("ref");

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/orders/${orderCode}`);
        setStatus(data.status === "paid" ? "✅ Payment successful!" : "⏳ Payment pending...");
      } catch (err) {
        setStatus("❌ Failed to retrieve payment status.");
      }
    };

    if (orderCode) checkStatus();
  }, [orderCode]);



  return (
    <div className="min-h-screen flex justify-center items-center p-4 bg-gray-50">
      <div className="flex flex-col justify-center items-center p-6 sm:p-8 bg-white rounded-xl shadow-2xl max-w-lg w-full mx-auto border border-gray-100">
        <div className="mb-6 sm:mb-8">
          <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-emerald-600" />
        </div>
        <h2 className="text-center mb-4 text-2xl sm:text-3xl font-bold text-gray-900">
              Payment Successful
        </h2>
        <p className="text-center text-gray-600 mb-6 sm:mb-8">
            Thank you for your payment! Your order has been completed
        successfully.
        </p>
      <h2>Payment Result</h2>
      <p>Order Code: {orderCode}</p>
      <p>Status: {status}</p>
        <button
          onClick={handleBackToHome}
          className="w-full bg-emerald-600 text-white py-2 sm:py-3 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 transition duration-200 ease-in-out disabled:bg-gray-400"
          aria-label="Return to Home"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default PayLaterSuccess;
