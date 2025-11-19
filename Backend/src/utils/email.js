import nodemailer from "nodemailer";

export const sendInvoiceEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"E-Commerce Shop" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });

    console.log("Invoice Email Sent To:", to);
  } catch (err) {
    console.log("EMAIL ERROR:", err);
  }
};
