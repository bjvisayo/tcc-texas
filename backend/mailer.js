const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  port: 465,
  secure: true,
  auth: {
    user: 'resend',
    pass: process.env.RESEND_API_KEY,
  },
});

async function sendLeadNotification(lead) {
  const { firstName, lastName, phone, email, service, message } = lead;
  const fullName = [firstName, lastName].filter(Boolean).join(' ');

  await transporter.sendMail({
    from: 'TCC Texas <onboarding@resend.dev>',
    to: process.env.EMAIL_TO,
    subject: `🚛 New Quote Request — ${service} — ${fullName}`,
    html: `
      <h2>New Quote Request</h2>
      <p><strong>Name:</strong> ${fullName}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Email:</strong> ${email || 'Not provided'}</p>
      <p><strong>Service:</strong> ${service}</p>
      <p><strong>Message:</strong> ${message || 'None'}</p>
    `,
  });
  console.log('📧 Email sent successfully!');
}

module.exports = { sendLeadNotification };