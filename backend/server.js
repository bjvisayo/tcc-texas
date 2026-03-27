// backend/server.js — Main Express server
require('dotenv').config();

const express   = require('express');
const path      = require('path');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');

const { initDB, insertLead, getAllLeads, updateStatus } = require('./db');
const { sendLeadNotification } = require('./mailer');
const { sendOwnerAlert }       = require('./alerts');

const app  = express();
const PORT = process.env.PORT || 3000;
console.log('Frontend path:', path.join(__dirname, '..'));

/* ── MIDDLEWARE ─────────────────────────── */
app.use(helmet({ contentSecurityPolicy: false }));
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());

// Rate limit the quote endpoint — max 5 requests per 15 min per IP
const quoteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max     : 5,
  message : { success: false, message: 'Too many requests. Please try again later or call us directly.' },
});

/* ── SERVE STATIC FRONTEND ──────────────── */
const frontendPath = path.join(__dirname);
app.use(express.static(frontendPath));

/* ── API: SUBMIT QUOTE ──────────────────── */
app.post('/api/quote', quoteLimiter, async (req, res) => {
  const { firstName, lastName, phone, email, service, message } = req.body;

  // Validate required fields
  if (!firstName?.trim() || !phone?.trim() || !service?.trim()) {
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  }

  // Basic phone validation
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length < 10) {
    return res.status(400).json({ success: false, message: 'Please enter a valid phone number.' });
  }

  const lead = {
    firstName : firstName.trim(),
    lastName  : (lastName || '').trim(),
    phone     : phone.trim(),
    email     : (email || '').trim(),
    service   : service.trim(),
    message   : (message || '').trim(),
    ip        : req.ip,
  };

  try {
    // 1. Save to database
    const leadId = insertLead(lead);
    console.log(`✅ Lead #${leadId} saved — ${lead.firstName} ${lead.lastName} | ${lead.service}`);

    // 2. Send email (non-blocking — don't fail the request if email fails)
    sendLeadNotification(lead).catch(err =>
      console.error('❌ Email error:', err.message)
    );

    // 3. Send WhatsApp / SMS alert (non-blocking)
if (process.env.TERMII_API_KEY) {
  sendOwnerAlert(lead).catch(err =>
    console.error('❌ Alert error:', err.message)
  );
}

    return res.json({ success: true, message: 'Quote request received!', id: leadId });

  } catch (err) {
    console.error('❌ Server error:', err);
    return res.status(500).json({ success: false, message: 'Server error. Please call us directly.' });
  }
});

/* ── API: GET ALL LEADS (admin) ─────────── */
// Protect this with a simple secret key in production
app.get('/api/leads', (req, res) => {
  const secret = req.headers['x-admin-key'];
  if (secret !== process.env.ADMIN_KEY) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const leads = getAllLeads();
  res.json({ success: true, count: leads.length, leads });
});

/* ── API: UPDATE LEAD STATUS ────────────── */
app.patch('/api/leads/:id', (req, res) => {
  const secret = req.headers['x-admin-key'];
  if (secret !== process.env.ADMIN_KEY) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const { status } = req.body;
  const validStatuses = ['new', 'contacted', 'quoted', 'won', 'lost'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status.' });
  }
  updateStatus(req.params.id, status);
  res.json({ success: true });
});

/* ── CATCH-ALL: serve index.html ────────── */
app.get('*', (req, res) => {
res.sendFile(path.join(__dirname, 'index.html'));
});

/* ── ADMIN DASHBOARD ────────────────────── */
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

/* ── START ──────────────────────────────── */
initDB().then(() => {
  app.listen(PORT, () => {
  console.log(`\n🚛 TCC Texas server running at http://localhost:${PORT}`);
    console.log(`📋 Admin leads: GET /api/leads  (requires x-admin-key header)\n`);
  });
}).catch(err => {
  console.error('❌ DB init failed:', err);
  process.exit(1);
});
