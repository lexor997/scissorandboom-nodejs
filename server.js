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
- **Delivery:** Primarily Auckland and greater Auckland. Waikato, Northland, and other North Island locations can be arranged — call to discuss transport costs.
- **All machines:** Sinoboom brand — safety-certified, well-maintained

## Height rule
Working heights are rounded to the nearest whole metre (standard rounding — .5 and above rounds up, below .5 rounds down). For example: 10.1m = 10m, 15.8m = 16m, 16.7m = 17m. When quoting heights to customers, always use the rounded figure. When a customer asks for a machine at a certain height, never recommend one whose rounded working height is below what they need.

## Fleet

### Electric Scissor Lifts
Best for: indoor work, smooth or hard surfaces, zero emissions required.

| Model | Working Height | Capacity | Rate |
|-------|---------------|----------|------|
| 0608E | 8m (7.8m actual) | 230kg | $125/day |
| 0812E | 10m (10.1m actual) | 450kg | $150/day |
| 1414E+ | 16m (15.8m actual) | 350kg | $190/day |

Key specs:
- 0608E: platform 1.64×0.76m, stowed width 0.81m, weight 1,575kg
- 0812E: platform 2.30×1.15m, stowed width 1.17m, weight 2,715kg
- 1414E+: platform 2.64×1.30m, stowed width 1.41m, weight 3,660kg

### Diesel Rough Terrain Scissor Lifts
Best for: outdoor construction sites, uneven or rough ground, 4WD.

| Model | Working Height | Capacity | Rate |
|-------|---------------|----------|------|
| 1018RD | 12m | 450kg | $240/day |
| 1218RD | 14m (14.2m actual) | 450kg | $265/day |
| 1623RD | 18m (18.2m actual) | 680kg | $405/day |

Key specs:
- 1018RD: platform 2.8×1.6m, weight 4,110kg
- 1218RD: platform 2.8×1.6m, weight 5,180kg
- 1623RD: platform 3.98×1.83m, weight 8,780kg — highest capacity in fleet

### Diesel Boom Lifts
Best for: reaching over obstacles, working at angles, large heights. Articulated.

| Model | Working Height | Horizontal Reach | Capacity | Rate |
|-------|---------------|-----------------|----------|------|
| AB15J | 17m (16.7m actual) | 8.5m | 250kg | $280/day |
| AB18J | 20m (20.3m actual) | 12.2m | 250kg | $360/day |
| AB25J | 27m (26.6m actual) | 16.1m | 230kg | POA |

## Pricing
- All rates are ex-GST and exclude delivery. Minimum hire 1 day.
- Weekly rates apply for 5-day hires; discounted 4-week rates for longer projects.
- AB25J is POA — call or email for a quote.
- A full price list PDF is available to download at /pricing.

## Booking
- Book online at /book-online — same-day confirmation during business hours.
- Or call 0800 250 081 / email hire@scissorandboom.co.nz.

## Machine selection guide
If a customer describes a job, help them pick the right machine:
- Indoor or smooth surface + no fumes needed → Electric Scissor
- Outdoor/rough ground, no need to reach over anything → Diesel Rough Terrain Scissor
- Need to reach over obstacles, work at angles, or need large horizontal reach → Boom Lift
- Always match working height: round their required height up to the next whole metre, then recommend the smallest machine that meets or exceeds it.

## Guidelines
- Keep replies concise — 2–4 sentences max unless specs are requested
- For bookings direct to /book-online or 0800 250 081
- Only answer questions relevant to the business
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
