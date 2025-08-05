import { newOrderFormWebHtmlBody } from "../../utils/newOrderFormWebHtmlBody";
import { sendMail } from "../../utils/sendMail";


export default function SendOrderEmail() {
  const handleSendEmail = () => {
    const dummyOrder = {
      customerName: "John Doe",
      customerContactNumber: "0123456789",
      customerDeliveryAddress: "123 High Street, London",
      orderDetails: [
        {
          productName: "Burger",
          quantity: 2,
          subtotal: 10.0,
          modifierListModel: [
            { productName: "Cheese", price: 1.5 },
            { productName: "Bacon", price: 2.0 }
          ]
        }
      ],
      bagCharge: 0.5,
      serviceCharge: 1.0,
      deliveryServiceAmount: 2.0,
      discountAmount: 1.0,
      totalAmount: 14.0,
      neetAmount: 13.0,
      paidFromCustomer: 13.0,
    };

    const htmlBody = newOrderFormWebHtmlBody(dummyOrder, "My Food Store", "Dhaka");

    sendMail(
      "info@restakepos.com",
      "My Food Store",
      "customer@email.com",
      "New Order Confirmation",
      htmlBody
    );
  };

  return (
    <div>
      <button onClick={handleSendEmail} style={{ padding: '10px 20px', background: '#3cb043', color: '#fff', border: 'none', borderRadius: '5px' }}>
        Send Order Email
      </button>
    </div>
  );
}
