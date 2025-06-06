const express = require('express');
const nodemailer = require('nodemailer');
const app = express();

app.use(express.json());

app.post('/api/send-order-email', async (req, res) => {
  const { order_name, customer_email, customer_first_name, line_items, total } = req.body;

  const html = `
    <div style="text-align:center;">
      <img src="https://cdn.shopify.com/s/files/1/0841/7545/4535/files/CRACK_LOGO_W_COL_STRAP_7611c3c5-ff84-43a1-b425-bf8322ae2c19.png" alt="GG Apparel Logo" width="150" />
    </div>
    <p>Hi ${customer_first_name},</p>
    <p>Thanks for your order!</p>
    <h3>Order Number: ${order_name}</h3>
    <h4>What you ordered:</h4>
    ${line_items.map(item => `
      <div style="margin-bottom:15px; display:flex;">
        <img src="${item.product?.featuredImage?.url || ''}" width="100" style="margin-right:10px;" />
        <div>
          <strong>${item.title}</strong><br/>
          <span>${item.variantTitle}</span>
        </div>
      </div>
    `).join('')}
    <p><strong>Total:</strong> £${total}</p>
    <p>GG Apparel Team</p>
  `;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: '"GG Apparel" <hello@ggapparel.co.uk>',
      to: customer_email,
      subject: `Order Confirmation – ${order_name}`,
      html
    });

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Email sending failed:", err);
    res.status(500).send('Failed to send email');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
