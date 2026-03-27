// backend/mailer.js — Resend HTTP API (no SMTP, works on Railway free)
const https = require('https');

async function sendLeadNotification(lead) {
  const { firstName, lastName, phone, email, service, message } = lead;
  const fullName = [firstName, lastName].filter(Boolean).join(' ');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#0A0C0E;padding:28px 32px">
        <h1 style="color:#E8A020;margin:0;font-size:22px">🚛 NEW QUOTE REQUEST</h1>
        <p style="color:#6B7A8D;margin:6px 0 0;font-size:13px">Trucking & Construction Company of Texas</p>
      </div>
      <div style="background:#fff;padding:32px;border:1px solid #eee">
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
        ${email ? `<p><strong>Email:</strong> ${email}</p>` : ''}
        <p><strong>Service:</strong> ${service}</p>
        ${message ? `<p><strong>Details:</strong> ${message}</p>` : ''}
        <a href="tel:${phone}" style="display:inline-block;background:#E8A020;color:#000;padding:14px 28px;text-decoration:none;font-weight:700;margin-top:16px">📞 Call ${fullName} Now</a>
      </div>
      <div style="background:#f9f9f9;padding:16px 32px;font-size:12px;color:#999">
        Received ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} CT · TCC Texas Website
      </div>
    </div>
  `;

  const payload = JSON.stringify({
    from   : 'TCC Texas <onboarding@resend.dev>',
    to     : [process.env.EMAIL_TO],
    subject: `🚛 New Quote Request — ${service} — ${fullName}`,
    html,
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.resend.com',
      path    : '/emails',
      method  : 'POST',
      headers : {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type' : 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('📧 Email sent successfully!');
          resolve(data);
        } else {
          reject(new Error(`Resend API error: ${res.statusCode} — ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

module.exports = { sendLeadNotification };