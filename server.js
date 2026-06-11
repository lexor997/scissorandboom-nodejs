const express = require('express');
const path = require('path');
require('dotenv').config();
const { Resend } = require('resend');
const Anthropic = require('@anthropic-ai/sdk');

const resend = new Resend(process.env.RESEND_API_KEY);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
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

// ── Chatbot API ───────────────────────────────────────────────
const CHAT_SYSTEM_PROMPT = `You are a friendly and knowledgeable assistant for Scissor And Boom Height Access Ltd, a New Zealand height access equipment hire company based in Auckland. Your job is to help visitors quickly find what they need and encourage them to book or call.

## About the company
- **Company:** Scissor And Boom Height Access Ltd (NZBN: 9429051110239)
- **Phone:** 0800 250 081
- **Email:** hire@scissorandboom.co.nz
- **Location:** East Tāmaki, Auckland (Highbrook area)
- **Hours:** Monday–Friday, business hours
- **Delivery:** Auckland and NZ-wide (contact for areas outside Auckland)
- **All machines:** Sinoboom brand — well-maintained, safety-certified

## Fleet

### Electric Scissor Lifts (indoor/smooth surfaces, zero emissions)
| Model | Working Height | Platform Size | Capacity |
|-------|---------------|---------------|----------|
| 0608E | 7.8m | 0.76 × 1.83m | 230kg |
| 0812E | 9.9m | 0.76 × 2.26m | 230kg |
| 1012E | 11.8m | 0.76 × 2.79m | 230kg |
| 1212E | 13.8m | 0.76 × 3.02m | 230kg |

### Diesel Rough Terrain Scissor Lifts (outdoor, uneven ground)
| Model | Working Height | Capacity |
|-------|---------------|----------|
| 1018RD | 11.8m | 450kg |
| 1218RD | 13.8m | 450kg |
| 1623RD | 19.0m | 450kg |

### Diesel Boom Lifts (articulated, for reaching over obstacles)
| Model | Working Height |
|-------|---------------|
| AB15J | 15m |
| AB18J | 18m |
| AB25J | 26.6m (tallest in fleet) |

## Pricing & Booking
- All prices are POA (price on application) — contact us for a quote
- Book online at /book-online or call 0800 250 081
- Same-day confirmation during business hours

## Guidelines
- Keep replies concise — 2–4 sentences max unless specs are requested
- For pricing always say it's POA and direct to call or email
- For bookings direct to /book-online or 0800 250 081
- If someone asks what machine they need for a job, help them pick based on height and terrain
- Only answer questions relevant to the business — don't go off-topic
- Be warm and professional — this is a small NZ business`;

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid request.' });
    }
    const safeMessages = messages.slice(-12).map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content).slice(0, 1000),
    }));
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 350,
      system: CHAT_SYSTEM_PROMPT,
      messages: safeMessages,
    });
    res.json({ reply: response.content[0].text });
  } catch (err) {
    console.error('Chat API error:', err);
    res.status(500).json({ error: 'Something went wrong. Please call us on 0800 250 081.' });
  }
});

app.get('/', (req, res) => res.render('index'));
app.get('/equipment', (req, res) => res.render('equipment'));
app.get('/about-us', (req, res) => res.render('about-us'));
app.get('/contact-us', (req, res) => res.render('contact-us'));
app.get('/book-online', (req, res) => res.render('book-online'));
app.get('/pricing', (req, res) => res.render('pricing'));
app.get('/terms-and-conditions', (req, res) => res.render('terms-and-conditions'));

// Redirect old .html URLs to clean URLs
const redirects = {
  '/index.html': '/',
  '/equipment.html': '/equipment',
  '/about-us.html': '/about-us',
  '/contact-us.html': '/contact-us',
  '/book-online.html': '/book-online',
  '/terms-and-conditions.html': '/terms-and-conditions',
  '/account-application.html': '/terms-and-conditions',
};
Object.entries(redirects).forEach(([from, to]) => {
  app.get(from, (req, res) => res.redirect(301, to));
});

app.listen(PORT, () => {
  console.log(`Scissor and Boom running at http://localhost:${PORT}`);
});
