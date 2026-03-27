// backend/mailer.js — Nodemailer email notifications
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host   : process.env.EMAIL_HOST || 'smtp.gmail.com',
  port   : parseInt(process.env.EMAIL_PORT) || 465,
  secure : true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send lead notification email to the business owner
 */
async function sendLeadNotification(lead) {
  const { firstName, lastName, phone, email, service, message } = lead;
  const fullName = [firstName, lastName].filter(Boolean).join(' ');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
        .card { background: #fff; max-width: 600px; margin: 0 auto; border-radius: 4px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: #0A0C0E; padding: 28px 32px; }
        .header h1 { color: #E8A020; font-size: 22px; margin: 0; letter-spacing: 1px; }
        .header p  { color: #6B7A8D; font-size: 13px; margin: 6px 0 0; }
        .body { padding: 32px; }
        .field { margin-bottom: 18px; }
        .label { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #6B7A8D; margin-bottom: 4px; }
        .value { font-size: 15px; color: #111; }
        .cta   { display: inline-block; background: #E8A020; color: #0A0C0E; padding: 14px 28px; text-decoration: none; font-weight: 700; font-size: 14px; letter-spacing: 1px; border-radius: 2px; margin-top: 8px; }
        .footer { background: #f9f9f9; padding: 16px 32px; border-top: 1px solid #eee; font-size: 12px; color: #999; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>🚛 NEW QUOTE REQUEST</h1>
          <p>Trucking &amp; Construction Company of Texas</p>
        </div>
        <div class="body">
          <div class="field">
            <div class="label">Name</div>
            <div class="value">${fullName}</div>
          </div>
          <div class="field">
            <div class="label">Phone</div>
            <div class="value"><a href="tel:${phone}">${phone}</a></div>
          </div>
          ${email ? `<div class="field"><div class="label">Email</div><div class="value"><a href="mailto:${email}">${email}</a></div></div>` : ''}
          <div class="field">
            <div class="label">Service Requested</div>
            <div class="value">${service}</div>
          </div>
          ${message ? `<div class="field"><div class="label">Project Details</div><div class="value">${message}</div></div>` : ''}
          <a href="tel:${phone}" class="cta">📞 Call ${fullName} Now</a>
        </div>
        <div class="footer">
          Received ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} CT · TCC Texas Website
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from   : process.env.EMAIL_FROM,
    to     : process.env.EMAIL_TO,
    subject: `🚛 New Quote Request — ${service} — ${fullName}`,
    html,
  });
}

module.exports = { sendLeadNotification };
