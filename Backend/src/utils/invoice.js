import PDFDocument from "pdfkit";
import fs from "fs";

export const generateInvoicePDF = (order) => {
  return new Promise((resolve) => {
    const filePath = `./invoices/invoice-${order._id}.pdf`;

    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(22).text("Invoice", { underline: true });
    doc.moveDown();

    doc.fontSize(14).text(`Order ID: ${order._id}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
    doc.text(`Payment: ${order.paymentMethod}`);
    doc.moveDown();

    doc.fontSize(18).text("Items:");
    order.items.forEach((item) => {
      doc
        .fontSize(14)
        .text(
          `${item.product.name} (₹${item.price}) × ${item.quantity} = ₹${
            item.price * item.quantity
          }`
        );
    });

    doc.moveDown();
    doc.fontSize(16).text(`Total Amount: ₹${order.totalAmount}`);

    doc.end();

    doc.on("finish", () => resolve(filePath));
  });
};
