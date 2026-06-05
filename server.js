const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ── Contact form API ─────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  try {
    const { full_name, phone_number, email, enquiry_type, message } = req.body;

    if (!full_name || !phone_number) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    await resend.emails.send({
      from: 'Scissor and Boom <hello@clouston.net>',
      to: 'hire@scissorandboom.co.nz',
      replyTo: email || undefined,
      subject: `${enquiry_type || 'Enquiry'} from ${full_name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;color:#212529;">
          <div style="background:#0a0a0a;padding:24px 32px;border-bottom:4px solid #e6cc17;">
            <h2 style="color:#e6cc17;margin:0;font-size:20px;">New Contact Enquiry</h2>
            <p style="color:#aaa;margin:6px 0 0;font-size:13px;">Submitted via scissorandboom.co.nz</p>
          </div>
          <div style="padding:28px 32px;">
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:6px 0;color:#666;width:160px;">Name</td><td style="padding:6px 0;font-weight:600;">${full_name}</td></tr>
              <tr><td style="padding:6px 0;color:#666;">Phone</td><td style="padding:6px 0;font-weight:600;">${phone_number}</td></tr>
              ${email ? `<tr><td style="padding:6px 0;color:#666;">Email</td><td style="padding:6px 0;"><a href="mailto:${email}" style="color:#c9b100;">${email}</a></td></tr>` : ''}
              ${enquiry_type ? `<tr><td style="padding:6px 0;color:#666;">Enquiry Type</td><td style="padding:6px 0;">${enquiry_type}</td></tr>` : ''}
            </table>
            ${message ? `
            <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:.08em;color:#e6cc17;border-bottom:1px solid #eee;padding-bottom:8px;margin:24px 0 12px;">Message</h3>
            <p style="font-size:14px;line-height:1.6;margin:0;">${message.replace(/\n/g, '<br>')}</p>
            ` : ''}
          </div>
          <div style="background:#f8f9fa;padding:16px 32px;border-top:1px solid #eee;">
            <p style="font-size:12px;color:#999;margin:0;">Sent from the Scissor and Boom contact form</p>
          </div>
        </div>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Contact email error:', err);
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

// ── Booking form API ──────────────────────────────────────────
app.post('/api/book', async (req, res) => {
  try {
    const {
      name, email, phone, company,
      equipment, quantity, startDate, endDate,
      deliveryAddress, accessNotes, extraInfo
    } = req.body;

    // Basic validation
    if (!name || !phone || !equipment || !startDate || !deliveryAddress) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    await resend.emails.send({
      from: 'Scissor and Boom <hello@clouston.net>',
      to: 'hire@scissorandboom.co.nz',
      replyTo: email || undefined,
      subject: `New Booking Request — ${equipment} — ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;color:#212529;">
          <div style="background:#0a0a0a;padding:24px 32px;border-bottom:4px solid #e6cc17;">
            <h2 style="color:#e6cc17;margin:0;font-size:20px;">New Booking Request</h2>
            <p style="color:#aaa;margin:6px 0 0;font-size:13px;">Submitted via scissorandboom.co.nz</p>
          </div>
          <div style="padding:28px 32px;">
            <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:.08em;color:#e6cc17;border-bottom:1px solid #eee;padding-bottom:8px;margin-bottom:16px;">Customer Details</h3>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:6px 0;color:#666;width:160px;">Name</td><td style="padding:6px 0;font-weight:600;">${name}</td></tr>
              <tr><td style="padding:6px 0;color:#666;">Phone</td><td style="padding:6px 0;font-weight:600;">${phone}</td></tr>
              ${email ? `<tr><td style="padding:6px 0;color:#666;">Email</td><td style="padding:6px 0;"><a href="mailto:${email}" style="color:#c9b100;">${email}</a></td></tr>` : ''}
              ${company ? `<tr><td style="padding:6px 0;color:#666;">Company</td><td style="padding:6px 0;">${company}</td></tr>` : ''}
            </table>

            <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:.08em;color:#e6cc17;border-bottom:1px solid #eee;padding-bottom:8px;margin-bottom:16px;margin-top:28px;">Equipment &amp; Dates</h3>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:6px 0;color:#666;width:160px;">Equipment</td><td style="padding:6px 0;font-weight:600;">${equipment}</td></tr>
              ${quantity ? `<tr><td style="padding:6px 0;color:#666;">Quantity</td><td style="padding:6px 0;">${quantity}</td></tr>` : ''}
              <tr><td style="padding:6px 0;color:#666;">Start Date</td><td style="padding:6px 0;font-weight:600;">${startDate}</td></tr>
              ${endDate ? `<tr><td style="padding:6px 0;color:#666;">End Date</td><td style="padding:6px 0;font-weight:600;">${endDate}</td></tr>` : ''}
            </table>

            <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:.08em;color:#e6cc17;border-bottom:1px solid #eee;padding-bottom:8px;margin-bottom:16px;margin-top:28px;">Delivery Details</h3>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:6px 0;color:#666;width:160px;">Delivery Address</td><td style="padding:6px 0;font-weight:600;">${deliveryAddress}</td></tr>
              ${accessNotes ? `<tr><td style="padding:6px 0;color:#666;">Site Access Notes</td><td style="padding:6px 0;">${accessNotes}</td></tr>` : ''}
            </table>

            ${extraInfo ? `
            <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:.08em;color:#e6cc17;border-bottom:1px solid #eee;padding-bottom:8px;margin-bottom:16px;margin-top:28px;">Additional Info</h3>
            <p style="font-size:14px;line-height:1.6;margin:0;">${extraInfo.replace(/\n/g, '<br>')}</p>
            ` : ''}
          </div>
          <div style="background:#f8f9fa;padding:16px 32px;border-top:1px solid #eee;">
            <p style="font-size:12px;color:#999;margin:0;">Sent from the Scissor and Boom online booking form</p>
          </div>
        </div>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Booking email error:', err);
    res.status(500).json({ error: 'Failed to send booking request.' });
  }
});

const viewsDir = path.join(__dirname, 'views');

function sendView(res, filename) {
  res.sendFile(path.join(viewsDir, filename));
}

app.get('/', (req, res) => sendView(res, 'index.html'));
app.get('/equipment', (req, res) => sendView(res, 'equipment.html'));
app.get('/about-us', (req, res) => sendView(res, 'about-us.html'));
app.get('/contact-us', (req, res) => sendView(res, 'contact-us.html'));
app.get('/book-online', (req, res) => sendView(res, 'book-online.html'));
app.get('/pricing', (req, res) => sendView(res, 'pricing.html'));
app.get('/terms-and-conditions', (req, res) => sendView(res, 'terms-and-conditions.html'));
app.get('/account-application', (req, res) => sendView(res, 'account-application.html'));

// Redirect old .html URLs to clean URLs
const redirects = {
  '/index.html': '/',
  '/equipment.html': '/equipment',
  '/about-us.html': '/about-us',
  '/contact-us.html': '/contact-us',
  '/book-online.html': '/book-online',
  '/terms-and-conditions.html': '/terms-and-conditions',
  '/account-application.html': '/account-application',
};
Object.entries(redirects).forEach(([from, to]) => {
  app.get(from, (req, res) => res.redirect(301, to));
});

app.listen(PORT, () => {
  console.log(`Scissor and Boom running at http://localhost:${PORT}`);
});
