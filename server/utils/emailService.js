const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendWelcomeEmail = async (to, guestName, uniqueKey) => {
  const mailOptions = {
    from: `"✨ Platinum Pearl" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: 'Welcome to Platinum Pearl! Your Check-in Key',
    html: `
      <h1>Welcome, ${guestName}!</h1>
      <p>Thank you for choosing to stay with us. You are now checked in.</p>
      <p>To manage your stay, add services, or check out, please use the following unique key on our website:</p>
      <h2 style="background-color: #f0f0f0; padding: 15px; text-align: center; letter-spacing: 2px;">${uniqueKey}</h2>
      <p>We hope you have a pleasant stay.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully to:', to);
    return true; // Return true on success
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false; // Return false on failure
  }
};

const sendBillEmail = async (to, bookingDetails, bill) => {
  const mailOptions = {
    from: `"Your Hotel Name" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: `Your Bill from Your Hotel Name - Room ${bookingDetails.room.roomNumber}`,
    html: `
      <h1>Thank you for staying with us, ${bookingDetails.guestName}!</h1>
      <p>Here is your final bill for your stay in room ${bookingDetails.room.roomNumber}.</p>
      <h2>Bill Details:</h2>
      <ul>
        ${bill.charges.map(charge => `<li>${charge.item}: $${charge.price.toFixed(2)}</li>`).join('')}
      </ul>
      <h3>Total: $${bill.total.toFixed(2)}</h3>
      <p>We hope you had a pleasant stay.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Bill email sent successfully to:', to);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = { sendBillEmail , sendWelcomeEmail };