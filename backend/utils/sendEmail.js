const nodemailer = require('nodemailer');

// Central email for all purposes
const DEFAULT_FROM = process.env.EMAIL_USER || 'znmart07@gmail.com';

const createTransporter = () => {
  const user = process.env.EMAIL_USER || 'znmart07@gmail.com';
  const pass = process.env.EMAIL_PASS;

  // If no password, use mock mode (log instead of sending)
  if (!pass || pass === 'password123' || pass === 'your_value_here') {
    console.log(`[Email Mock] No EMAIL_PASS set, using mock transporter for ${user}`);
    return {
      sendMail: async (opts) => {
        console.log(`[Email Mock] From: ${opts.from}`);
        console.log(`[Email Mock] To: ${opts.to}`);
        console.log(`[Email Mock] Subject: ${opts.subject}`);
        console.log(`[Email Mock] Text: ${opts.text?.substring(0, 200)}`);
        return { messageId: `mock_${Date.now()}`, mocked: true };
      }
    };
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = createTransporter();
    const from = process.env.EMAIL_USER || 'znmart07@gmail.com';
    const info = await transporter.sendMail({
      from: `"ZN Mart" <${from}>`,
      to,
      subject,
      text,
      html
    });
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error('Email send failed:', err.message);
    // Don't throw - order should still succeed even if email fails
    return { error: err.message, mocked: true };
  }
};

const sendOrderConfirmation = async (order, userEmail, userName) => {
  const to = userEmail;
  const subject = `ZN Mart - Order #${String(order._id).slice(-8).toUpperCase()} Placed Successfully!`;
  const text = `Hi ${userName || 'Customer'},\n\nYour order has been placed successfully!\n\nOrder ID: ${order._id}\nTotal: $${order.totalPrice}\nPayment: ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card'}\nStatus: ${order.status}\n\nWe will confirm and ship soon. Thank you for shopping at ZN Mart!\n\nFrom: ZN Mart <znmart07@gmail.com>`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #6C4CF1, #8B5CF6); color: white; padding: 24px; text-align: center;">
        <h1 style="margin: 0;">ZN Mart</h1>
        <p style="margin: 4px 0 0; opacity: 0.9;">Your order is confirmed!</p>
      </div>
      <div style="padding: 24px;">
        <h2 style="color: #333;">Hi ${userName || 'Customer'},</h2>
        <p>Your order <strong>#${String(order._id).slice(-8).toUpperCase()}</strong> has been placed successfully!</p>
        <div style="background: #f8f7ff; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Total:</strong> $${order.totalPrice}</p>
          <p style="margin: 4px 0;"><strong>Payment:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery - Pay at doorstep' : 'Card Paid'}</p>
          <p style="margin: 4px 0;"><strong>Status:</strong> ${order.status}</p>
          <p style="margin: 4px 0;"><strong>Items:</strong> ${order.items?.length || 0}</p>
        </div>
        <p>We will process and ship your order soon. You will receive updates via email/SMS.</p>
        <p style="color: #666; font-size: 12px; margin-top: 24px;">From: ZN Mart &lt;znmart07@gmail.com&gt; | www.znmart.shop</p>
      </div>
    </div>
  `;
  return sendEmail({ to, subject, text, html });
};

const sendAdminConfirmation = async (order, customerEmail, customerName, phone) => {
  const to = customerEmail;
  const subject = `ZN Mart - Your order #${String(order._id).slice(-8).toUpperCase()} is confirmed!`;
  const text = `Hi ${customerName || 'Customer'},\n\nYour order can be placed successfully!\n\nOrder ID: ${order._id}\nTotal: $${order.totalPrice}\nStatus: ${order.status}\n\nOur team confirmed your order. Delivery in 3-5 days. Keep cash ready for COD.\n\nThank you!\nZN Mart <znmart07@gmail.com> | Phone: ${phone || ''}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
      <div style="background: #10B981; color: white; padding: 24px; text-align: center;">
        <h2 style="margin: 0;">✓ Order Confirmed</h2>
        <p style="margin: 4px 0 0;">ZN Mart Admin</p>
      </div>
      <div style="padding: 24px;">
        <h3>Hi ${customerName || 'Customer'},</h3>
        <p><strong>Your order can be placed successfully!</strong></p>
        <p>Order <strong>#${String(order._id).slice(-8).toUpperCase()}</strong> confirmed by admin.</p>
        <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p><strong>Total:</strong> $${order.totalPrice} ${order.paymentMethod === 'cod' ? '(Cash on Delivery)' : ''}</p>
          <p><strong>Status:</strong> ${order.status}</p>
        </div>
        <p>We will notify you via email and SMS at ${phone || to}.</p>
        <p style="color: #666; font-size: 12px; margin-top: 24px;">Contact: znmart07@gmail.com | www.znmart.shop</p>
      </div>
    </div>
  `;
  return sendEmail({ to, subject, text, html });
};

module.exports = { sendEmail, sendOrderConfirmation, sendAdminConfirmation, DEFAULT_FROM };