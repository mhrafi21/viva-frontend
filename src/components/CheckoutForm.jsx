import  { useState, useEffect } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router";
import { ref, set, update } from "firebase/database";
import { database } from "../firebase/firebaseConfig";
import { toast } from "react-toastify";
import SendOrderEmail from "./SendOrderEmail";

const CheckoutForm = ({ stripeData }) => {
  const stripe = useStripe();
  const [timeLeft, setTimeLeft] = useState(120);
  const elements = useElements();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // Start with loading true
  const [initialLoading, setInitialLoading] = useState(true); // For initial data fetch
  const [searchParams] = useSearchParams();
  const [orderAmount, setOrderAmount] = useState(0);
  const navigate = useNavigate();
  const nAmount = orderAmount.toFixed(2); // Default to 0.00 if not provided
  const netAmount = Number(nAmount);
  const orderId = searchParams.get("orderId") || "no-order-id";
  const userId = searchParams.get("userId") || "no-user-id";
  const token = searchParams.get("token") || "no-token";

  const [ipAddress, setIPAddress] = useState("");
  const [deviceID, setDeviceID] = useState("");

  // Back event
  const handleBack = () => {
    window.location.href = "https://maloncho.foodpos.io/profile";
  };

  // Fetch order amount
  useEffect(() => {
    const fetchOrderAmount = async () => {
      try {
        const response = await axios.post(
          `${
            import.meta.env.VITE_BASE_URL
          }/api/orderMaster/findById?orderId=${orderId}`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOrderAmount(response?.data?.obj?.neetAmount || 0);
      } catch (err) {
        console.log(err.message);
      } finally {
        setInitialLoading(false); // Stop loading once data is fetched
      }
    };
    fetchOrderAmount();
  }, [orderId, token]);

  // Fetch IP address and device ID
  useEffect(() => {
    const fetchIPAndDevice = async () => {
      try {
        // Fetch IP address
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipResponse.json();
        setIPAddress(ipData.ip);

        // Generate device ID
        const userAgent = window.navigator.userAgent;
        const vendor = window.navigator.vendor || "";
        const language = window.navigator.language || "";
        const screenResolution = `${window.screen.width}x${window.screen.height}`;
        const randomString =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);
        const deviceID = `${userAgent}-${vendor}-${language}-${screenResolution}-${randomString}`;
        setDeviceID(deviceID);
      } catch (error) {
        console.log(error);
      } finally {
        setInitialLoading(false); // Stop loading once data is fetched
      }
    };
    fetchIPAndDevice();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      metadata: {
        orderId: orderId,
        userId: userId,
      },
      redirect: "if_required",
      confirmParams: {
        return_url: `https://pay.foodpos.io/success?orderId=${orderId}&userId=${userId}&token=${token}`,
      },
    });

    if (error) {
      setLoading(false);
      setMessage(error.message || "Payment failed");
      toast.error(error.message);
    }

    // Data set after payment DONE
    try {
      await set(
        ref(database, `foodpos/maloncho/stripe/user/${userId}/${orderId}`),
        {
          netAmount: netAmount,
          ipAddress: ipAddress,
          deviceID: deviceID,
          orderId: orderId,
          payment_status: "DONE",
          payment_submit: false,
          paymenttext: "paymentIntent",
          userId: userId,
        }
      );
    } catch (error) {
      console.error("Error writing to Firebase:", error);
    }

    // Fetch data by ID
    try {
      const resById = await axios.post(
        `https://cluster.restakepos.com/api/customerUser/findByCustId`,
        {
          custId: userId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const {custMail} = resById?.data?.obj || {};
      if (!custMail){
        throw new Error("No customer email found for the given user ID.")
      }

      console.log("Data fetched by ID:", custMail );

    } catch (error) {
      console.error("Error get data:", error);
    }

    if (paymentIntent?.status === "succeeded") {
      const updatePaymentInfoWithId = {
        orderId: Number(orderId),
        status: "SETTLED",
        isActive: 1,
        totalPayment: paymentIntent?.amount / 100 || 0.0,
        note: JSON.stringify(paymentIntent) || "no payment intent",
        remarks: "web pay",
        paymentDetails: {
          orderAmount: paymentIntent?.amount / 100 || 0.0,
          paymentType: paymentIntent?.payment_method_types[0] || "stripe",
          cardPayment: paymentIntent?.amount / 100 || 0.0,
          totalPayment: paymentIntent?.amount / 100 || 0.0,
        },
      };

      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/orderMaster/paymentUpdate`,
        updatePaymentInfoWithId,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Payment Succeeded!");

      try {
        await update(
          ref(database, `foodpos/maloncho/stripe/user/${userId}/${orderId}`),
          {
            payment_submit: true,
          }
        );
      } catch (error) {
        console.error("Error writing to Firebase:", error);
      }
      navigate(`/success?orderId=${orderId}&userId=${userId}&token=${token}`);
    }
    setLoading(false);
  };

  const handlePayLater = async () => {
    const updatePaymentInfoWithId = {
      orderId: Number(orderId),
      status: "PAYLATER",
      isActive: 1,
      totalPayment: netAmount || 0.0,
      note: "",
      remarks: "paylater",
      paymentDetails: {
        orderAmount: netAmount || 0.0,
        paymentType: "",
        cardPayment: 0.0,
        totalPayment: 0.0,
      },
    };

    await axios.put(
      `${import.meta.env.VITE_BASE_URL}/api/orderMaster/paymentUpdate`,
      updatePaymentInfoWithId,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    window.location.href = "https://maloncho.foodpos.io/profile";
  };

  // Countdown and redirect logic

  useEffect(() => {
    let countdownInterval;
    let redirectTimeout;

    countdownInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    redirectTimeout = setTimeout(() => {
      toast.info("Redirecting to home due to inactivity.");
      window.location.href = "https://maloncho.foodpos.io";
    }, 120000);

    const handleUserInteraction = () => {
      clearInterval(countdownInterval);
      clearTimeout(redirectTimeout);
      document.body.removeEventListener("click", handleUserInteraction);
    };

    document.body.addEventListener("click", handleUserInteraction);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(redirectTimeout);
      document.body.removeEventListener("click", handleUserInteraction);
    };
  }, []);

  return (
    <div>
      {initialLoading ? (
        <div className="min-h-screen flex justify-center items-center">
          <div className="flex items-center justify-center space-x-2 animate-pulse">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto p-4 max-w-4xl">
          <div className="mb-5">
            <button
              className="flex items-center gap-2 cursor-pointer font-semibold"
              onClick={handleBack}
            >
              <svg
                enableBackground="new 0 0 24 24"
                height="18px"
                version="1.1"
                viewBox="0 0 32 32"
                width="18px"
                xmlSpace="preserve"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
              >
                <path
                  clipRule="evenodd"
                  d="M31.106,15H3.278l8.325-8.293  c0.391-0.391,0.391-1.024,0-1.414c-0.391-0.391-1.024-0.391-1.414,0l-9.9,9.899c-0.385,0.385-0.385,1.029,0,1.414l9.9,9.9  c0.391,0.391,1.024,0.391,1.414,0c0.391-0.391,0.391-1.024,0-1.414L3.278,17h27.828c0.552,0,1-0.448,1-1  C32.106,15.448,31.658,15,31.106,15z"
                  fill="#121313"
                  fillRule="evenodd"
                  id="Arrow_Back"
                />
                <g />
                <g />
                <g />
                <g />
                <g />
                <g />
              </svg>
              Back
            </button>
          </div>

          {timeLeft > 0 && (
            <div className="text-red-600 font-semibold mb-4 text-center">
              You’ll be redirected in {Math.floor(timeLeft / 60)}:
              {(timeLeft % 60).toString().padStart(2, "0")} due to inactivity.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center md:text-start">
              <p className="mb-2 ">
                <span className="text-blue-500">
                  Order Total: <strong>£{nAmount}</strong> +
                </span>{" "}
                <span className="text-blue-500">
                  Platform Fee: <strong>£{stripeData?.fee}</strong>
                </span>
              </p>

              <p className=" text-2xl">
                <span>Payable amount:</span>{" "}
                <strong>
                  £{Number(netAmount.toFixed(2)) + stripeData?.fee}
                </strong>
              </p>
            </div>
            <div className="">
              <div className="">
                <div className="mt-3">
                  <form onSubmit={handleSubmit}>
                    <PaymentElement />
                    <button
                      disabled={loading || !stripe}
                      className="mt-4 w-full bg-[#007bff] text-white py-2 rounded hover:bg-blue-600 transition"
                    >
                      {loading ? " Processing…" : " Pay With Card "}
                    </button>
                  </form>
                </div>

                <div className="flex items-center gap-4 my-1">
                  <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    OR
                  </div>
                  <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                </div>

                <div>
                  <button
                    onClick={handlePayLater}
                    className="w-full bg-[#007bff] text-white py-2 rounded hover:bg-blue-600 transition"
                  >
                    Pay Upon Arrival
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutForm;
