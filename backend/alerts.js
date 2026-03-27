// backend/alerts.js — Termii SMS alerts
const https = require('https');

async function sendOwnerAlert(lead) {
  const { firstName, lastName, phone, service } = lead;
  const fullName = [firstName, lastName].filter(Boolean).join(' ');

  const message =
    `🚛 NEW LEAD - TCC Texas\n` +
    `Name: ${fullName}\n` +
    `Phone: ${phone}\n` +
    `Service: ${service}\n` +
    `Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} CT`;

  const payload = JSON.stringify({
    to     : process.env.TERMII_TO,
    from   : 'TCC Texas',
    sms    : message,
    type   : 'plain',
    api_key: process.env.TERMII_API_KEY,
    channel: 'generic',
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.ng.termii.com',
      path    : '/api/sms/send',
      method  : 'POST',
      headers : {
        'Content-Type'  : 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('📱 Alert sent:', data);
        resolve(data);
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

module.exports = { sendOwnerAlert };