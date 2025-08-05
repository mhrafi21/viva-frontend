import { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import CheckoutForm from "./CheckoutForm";
import { useSearchParams } from "react-router";
import { ref, get } from "firebase/database";
import { database } from "../firebase/firebaseConfig";
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PaymentStripe = () => {
  const [clientSecret, setClientSecret] = useState("");
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const token = searchParams.get("token");
  const [orderNetAmount, setOrderNetAmount] = useState(null);
  const [stripeData, setStripeData] = useState(null);

  // Fetch order amount
  useEffect(() => {
    if (orderId && token) {
      axios
        .post(
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
        )
        .then((res) => {
          const amount = res?.data?.obj?.neetAmount;
          if (amount) setOrderNetAmount(Number(amount));
        })
        .catch((err) =>
          console.error("Fetch order amount error:", err.message)
        );
    }
  }, [orderId, token]);

  // get data from stripe

  useEffect(() => {
    const fetchStripeData = async () => {
      try {
        const stripeRef = ref(database, "foodpos/maloncho/stripe");
        const snapshot = await get(stripeRef);

        if (snapshot.exists()) {
          const fullData = snapshot.val();

          // Remove the 'user' key if it exists

          setStripeData({ acct: fullData?.acct, fee: fullData?.fee });
        } else {
          console.warn("No Stripe data found.");
        }
      } catch (error) {
        console.error("Error fetching Stripe data:", error);
      }
    };

    fetchStripeData();
  }, []);

  // Create payment intent only after orderNetAmount is available
  useEffect(() => {
    if (
      orderNetAmount &&
      orderNetAmount > 0 &&
      stripeData?.acct &&
      stripeData?.fee
    ) {
      const payload = {
        amount:
          Math.round(Number(orderNetAmount) + Number(stripeData?.fee)) * 100, // e.g., $0.95 → 95
        fee: stripeData?.fee, // e.g., $3.00 → 300
        acct: stripeData?.acct,
      };
      axios
        .post(
          `${import.meta.env.VITE_BASE_URL}/payment/create-payment-intent`,
          payload
        )
        .then((res) => {
          setClientSecret(res?.data?.clientSecret);
        })
        .catch((err) => {
          console.error(
            "Create payment intent error:",
            err.response?.data || err.message || err
          );
        });
    }
  }, [orderNetAmount, stripeData]);

  const appearance = {
    theme: "stripe",
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <>
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm stripeData={stripeData} />
        </Elements>
      )}
    </>
  );
};

export default PaymentStripe;
