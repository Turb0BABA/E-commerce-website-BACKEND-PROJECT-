export const generateInvoiceHTML = (order, user) => {
  return `
    <h2>Order Invoice #${order._id.slice(-6)}</h2>

    <p><strong>Name:</strong> ${user.name}</p>
    <p><strong>Email:</strong> ${user.email}</p>
    <p><strong>Total:</strong> ₹${order.totalAmount}</p>
    <p><strong>Payment:</strong> ${order.paymentMethod}</p>
    <p><strong>Address:</strong><br>${order.address}</p>

    <h3>Items:</h3>
    <ul>
      ${order.items
        .map(
          (item) =>
            `<li>${item.quantity} × ${item.price} — ₹${
              item.quantity * item.price
            }</li>`
        )
        .join("")}
    </ul>

    <p>Thank you for shopping with us!</p>
  `;
};
     