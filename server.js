const express = require('express');
const path = require('path');
require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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

// ── Sitemap ───────────────────────────────────────────────────
app.get('/sitemap.xml', (req, res) => {
  const pages = [
    { loc: '/',                     priority: '1.0', changefreq: 'weekly'  },
    { loc: '/equipment',            priority: '0.9', changefreq: 'monthly' },
    { loc: '/pricing',              priority: '0.8', changefreq: 'monthly' },
    { loc: '/book-online',          priority: '0.8', changefreq: 'monthly' },
    { loc: '/contact-us',           priority: '0.7', changefreq: 'yearly'  },
    { loc: '/about-us',             priority: '0.6', changefreq: 'yearly'  },
    { loc: '/account-application',  priority: '0.5', changefreq: 'yearly'  },
    { loc: '/terms-and-conditions', priority: '0.2', changefreq: 'yearly'  },
  ];
  const today = new Date().toISOString().split('T')[0];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>https://scissorandboom.co.nz${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  res.set('Content-Type', 'application/xml');
  res.send(xml);
});

// ── Account Application API ───────────────────────────────────
app.post('/api/account', async (req, res) => {
  try {
    const d = req.body;
    if (!d.companyName || !d.contactName || !d.contactPhone || !d.contactEmail) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const row = (label, value) => value
      ? `<tr><td style="padding:5px 0;color:#666;width:200px;vertical-align:top;">${label}</td><td style="padding:5px 0;font-weight:600;">${value}</td></tr>`
      : '';

    await resend.emails.send({
      from: 'Scissor and Boom <hello@clouston.net>',
      to: 'hire@scissorandboom.co.nz',
      replyTo: d.contactEmail,
      subject: `New Account Application — ${d.companyName}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;color:#212529;">
          <div style="background:#0a0a0a;padding:24px 32px;border-bottom:4px solid #e6cc17;">
            <h2 style="color:#e6cc17;margin:0;font-size:20px;">New Account Application</h2>
            <p style="color:#aaa;margin:6px 0 0;font-size:13px;">Submitted via scissorandboom.co.nz</p>
          </div>
          <div style="padding:28px 32px;">

            <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#e6cc17;border-bottom:1px solid #eee;padding-bottom:8px;margin-bottom:12px;">Company Details</h3>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              ${row('Legal Company Name', d.companyName)}
              ${row('Trading Name', d.tradingName)}
              ${row('NZBN', d.nzbn)}
              ${row('GST Number', d.gstNumber)}
              ${row('Business Type', d.businessType)}
              ${row('Industry', d.industry)}
              ${row('Business Address', d.businessAddress)}
              ${row('Postal Address', d.postalAddress)}
            </table>

            <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#e6cc17;border-bottom:1px solid #eee;padding-bottom:8px;margin:24px 0 12px;">Primary Contact</h3>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              ${row('Name', d.contactName)}
              ${row('Position', d.contactPosition)}
              ${row('Phone', d.contactPhone)}
              ${row('Email', d.contactEmail)}
              ${row('Accounts Email', d.accountsEmail)}
              ${row('Accounts Phone', d.accountsPhone)}
            </table>

            <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#e6cc17;border-bottom:1px solid #eee;padding-bottom:8px;margin:24px 0 12px;">Credit &amp; Delivery</h3>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              ${row('Requested Credit Limit', d.creditLimit)}
              ${row('Est. Monthly Spend', d.monthlySpend)}
              ${row('Delivery Areas', d.deliveryAreas)}
              ${row('Equipment Needed', d.equipmentNeeded)}
            </table>

            <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#e6cc17;border-bottom:1px solid #eee;padding-bottom:8px;margin:24px 0 12px;">Trade References</h3>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td colspan="2" style="padding:4px 0;font-weight:700;color:#333;">Reference 1</td></tr>
              ${row('Company', d.ref1Company)}
              ${row('Contact', d.ref1Contact)}
              ${row('Phone', d.ref1Phone)}
              ${row('Email', d.ref1Email)}
              <tr><td colspan="2" style="padding:12px 0 4px;font-weight:700;color:#333;">Reference 2</td></tr>
              ${row('Company', d.ref2Company)}
              ${row('Contact', d.ref2Contact)}
              ${row('Phone', d.ref2Phone)}
              ${row('Email', d.ref2Email)}
            </table>

            <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#e6cc17;border-bottom:1px solid #eee;padding-bottom:8px;margin:24px 0 12px;">Declaration</h3>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              ${row('Authorised Signatory', d.signatoryName)}
              ${row('Position', d.signatoryPosition)}
              ${row('Agreed to Terms', d.agreeTerms ? 'Yes' : 'No')}
            </table>

            ${d.additionalNotes ? `
            <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#e6cc17;border-bottom:1px solid #eee;padding-bottom:8px;margin:24px 0 12px;">Additional Notes</h3>
            <p style="font-size:14px;line-height:1.6;margin:0;">${d.additionalNotes.replace(/\n/g, '<br>')}</p>
            ` : ''}
          </div>
          <div style="background:#f8f9fa;padding:16px 32px;border-top:1px solid #eee;">
            <p style="font-size:12px;color:#999;margin:0;">Submitted from the Scissor and Boom account application form</p>
          </div>
        </div>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Account application error:', err);
    res.status(500).json({ error: 'Failed to send application.' });
  }
});

app.get('/', (req, res) => res.render('index'));
app.get('/equipment', (req, res) => res.render('equipment'));
app.get('/about-us', (req, res) => res.render('about-us'));
app.get('/contact-us', (req, res) => res.render('contact-us'));
app.get('/book-online', (req, res) => res.render('book-online'));
app.get('/pricing', (req, res) => res.render('pricing'));
app.get('/terms-and-conditions', (req, res) => res.render('terms-and-conditions'));
app.get('/account-application', (req, res) => res.render('account-application'));

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
