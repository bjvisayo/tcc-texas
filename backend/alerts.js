// backend/alerts.js — Twilio WhatsApp / SMS alerts
const twilio = require('twilio');

let client;
function getClient() {
  if (!client) {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  return client;
}

/**
 * Send WhatsApp or SMS alert to the owner
 */
async function sendOwnerAlert(lead) {
  const { firstName, lastName, phone, service } = lead;
  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  const alertType = (process.env.ALERT_TYPE || 'whatsapp').toLowerCase();

  const body =
    `🚛 NEW LEAD — TCC Texas\n` +
    `Name: ${fullName}\n` +
    `Phone: ${phone}\n` +
    `Service: ${service}\n` +
    `Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} CT`;

  const from = alertType === 'sms'
    ? process.env.TWILIO_FROM
    : `whatsapp:${process.env.TWILIO_FROM}`;

  const to = alertType === 'sms'
    ? process.env.TWILIO_TO
    : `whatsapp:${process.env.TWILIO_TO}`;

  await getClient().messages.create({ body, from, to });
}

module.exports = { sendOwnerAlert };
