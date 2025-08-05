export const newOrderFormWebHtmlBody = (order, companyName, address) => {

  let orderDetailsHtml = '';

  order.orderDetails?.forEach(detail => {
    orderDetailsHtml += `
      <tr>
        <td style="padding: 8px 0;">${detail.quantity}x ${detail.productName}</td>
        <td style="padding: 8px 0; text-align: right;">£${detail.subtotal?.toFixed(2)}</td>
      </tr>
    `;

    if (detail.modifierListModel) {
      detail.modifierListModel.forEach(modifier => {
        const modifierTotal = modifier.price * detail.quantity;
        orderDetailsHtml += `
          <tr>
            <td style="padding: 8px 0;"> - ${detail.quantity}x ${modifier.productName}</td>
            <td style="padding: 8px 0; text-align: right;">£${modifierTotal.toFixed(2)}</td>
          </tr>
        `;
      });
    }

    orderDetailsHtml += `
      <tr>
        <td colspan="2"><div style="border-top: 1px solid #ccc; margin: 5px 0;"></div></td>
      </tr>
    `;
  });



  return `
  <!DOCTYPE html>
  <html>
  <body style="font-family: Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="background: #3cb043; color: white; padding: 20px; text-align: center;">
        <h2>${companyName}</h2>
        <p>You received a new order</p>
      </td></tr>

      <tr><td style="padding: 15px;">
        <p><strong>Name:</strong> ${order.customerName}</p>
        <p><strong>Phone:</strong> ${order.customerContactNumber}</p>
        <p><strong>Address:</strong> ${order.customerDeliveryAddress}</p>
      </td></tr>

      <tr><td><hr /></td></tr>

      <tr><td style="padding: 15px;">
        <h3>Order Details</h3>
        <table width="100%">
          ${orderDetailsHtml}
        </table>
      </td></tr>

      <tr><td><hr /></td></tr>

      <tr><td style="padding: 15px;">
        <table width="100%">
          ${order.bagCharge ? `<tr><td>Bag Charge:</td><td align="right">£${order.bagCharge.toFixed(2)}</td></tr>` : ''}
          ${order.serviceCharge ? `<tr><td>Service Charge:</td><td align="right">£${order.serviceCharge.toFixed(2)}</td></tr>` : ''}
          ${order.deliveryServiceAmount ? `<tr><td>Delivery Charge:</td><td align="right">£${order.deliveryServiceAmount.toFixed(2)}</td></tr>` : ''}
          ${order.discountAmount ? `<tr><td>Discount:</td><td align="right">-£${order.discountAmount.toFixed(2)}</td></tr>` : ''}
          ${order.totalAmount ? `<tr><td>Total:</td><td align="right">£${order.totalAmount.toFixed(2)}</td></tr>` : ''}
          ${order.neetAmount ? `<tr><td><strong>Net Total:</strong></td><td align="right"><strong>£${order.neetAmount.toFixed(2)}</strong></td></tr>` : ''}
        </table>
      </td></tr>
    </table>
  </body>
  </html>
  `;
};
