# 🚛 Trucking & Construction Company of Texas — Website

Full-stack website with Node.js/Express backend, SQLite lead database, email notifications, and WhatsApp/SMS alerts.

---

## 📁 Project Structure

```
tcc-texas/
├── public/                  # Frontend (served as static files)
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── script.js
├── backend/
│   ├── server.js            # Express server (main entry point)
│   ├── db.js                # SQLite database setup & queries
│   ├── mailer.js            # Email notifications (Nodemailer)
│   ├── alerts.js            # WhatsApp / SMS alerts (Twilio)
│   ├── .env.example         # Environment variable template
│   └── package.json
└── README.md
```

---

## 🚀 Quick Start (Local)

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
# Then edit .env with your real credentials
```

### 3. Run the server
```bash
# Development (auto-restarts on changes)
npm run dev

# Production
npm start
```

Visit: **http://localhost:3000**

---

## ⚙️ Environment Variables (`.env`)

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 3000) |
| `EMAIL_USER` | Gmail address to send FROM |
| `EMAIL_PASS` | Gmail App Password (not your login password) |
| `EMAIL_TO` | Owner's email to receive leads |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token |
| `TWILIO_FROM` | Twilio WhatsApp number (+14155238886 for sandbox) |
| `TWILIO_TO` | Owner's WhatsApp number (e.g. +18179253642) |
| `ALERT_TYPE` | `whatsapp` or `sms` |
| `ADMIN_KEY` | Secret key to access /api/leads |
| `DB_PATH` | Path to SQLite database file |

---

## 📧 Email Setup (Gmail)

1. Go to your Google Account → **Security → 2-Step Verification** (enable it)
2. Go to **Security → App Passwords**
3. Create an App Password for "Mail"
4. Paste that 16-character password as `EMAIL_PASS` in your `.env`

---

## 📱 WhatsApp Setup (Twilio)

1. Sign up at [twilio.com](https://twilio.com) (free trial works)
2. Go to **Messaging → Try it Out → Send a WhatsApp Message**
3. Follow sandbox activation steps (send a WhatsApp to +1 415 523 8886)
4. Add your credentials to `.env`

> **For production WhatsApp:** Apply for a Twilio WhatsApp Business number (~$5/mo)
> **For SMS instead:** Set `ALERT_TYPE=sms` and use a regular Twilio number

---

## 🗄️ Database

Leads are stored in `backend/data/leads.db` (SQLite — no setup required).

### View leads (API)
```bash
curl http://localhost:3000/api/leads \
  -H "x-admin-key: YOUR_ADMIN_KEY"
```

### Update lead status
```bash
curl -X PATCH http://localhost:3000/api/leads/1 \
  -H "x-admin-key: YOUR_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{"status": "contacted"}'
```

**Valid statuses:** `new` → `contacted` → `quoted` → `won` / `lost`

---

## 🌐 Deploy to Production

### Option A — Railway (Easiest, ~$5/mo)
1. Push to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add all your `.env` variables in Railway's dashboard
4. Railway auto-detects Node.js and deploys

### Option B — VPS (DigitalOcean / Linode)
```bash
# On your server:
git clone your-repo
cd tcc-texas/backend && npm install
cp .env.example .env && nano .env   # fill in credentials

# Install PM2 to keep it running
npm install -g pm2
pm2 start server.js --name tcc-texas
pm2 save && pm2 startup

# Use Nginx as reverse proxy on port 80/443
```

### Option C — Render (Free tier available)
1. Push to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Root directory: `backend`, Build: `npm install`, Start: `node server.js`
4. Add env vars in Render dashboard

---

## 🔒 Security Notes

- The `/api/leads` endpoint is protected by `x-admin-key` — set a strong random key
- Rate limiting is applied to `/api/quote` (5 submissions per 15 min per IP)
- Helmet.js sets secure HTTP headers automatically
- Never commit your `.env` file (it's already in `.gitignore`)

---

## 📞 Business Info

- **Address:** 4101 FM2280, Cleburne, TX 76031
- **Phone:** +1 817-925-3642
- **Hours:** Mon–Fri 7am–6pm, Sat 8am–2pm
