/**
 * Generates public/Price-List-Jun-Sep-2026.pdf
 * Run with: node scripts/generate-pricelist.js
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'public', 'Price-List-Jun-Sep-2026.pdf');

const YELLOW = '#e6cc17';
const BLACK  = '#0a0a0a';
const WHITE  = '#ffffff';
const GREY   = '#f5f5f5';
const DGREY  = '#444444';
const BORDER = '#dddddd';

const LOGO = path.join(__dirname, '..', 'public', 'images', 'logo-colour.png');

// ── Data ──────────────────────────────────────────────────────────────────────

const sections = [
  {
    title: 'Electric Scissor Lifts',
    rows: [
      { model: '0608ME', desc: 'Electric Scissor Lift (810mm wide)',  platform: '5.8m',  working: '7.8m',  daily: '$125', weekly: '$350',   monthly: '$800',   transport: '$150' },
      { model: '0812E',  desc: 'Electric Scissor Lift (1170mm wide)', platform: '8.1m',  working: '10.1m', daily: '$150', weekly: '$395',   monthly: '$850',   transport: '$150' },
      { model: '1414E+', desc: 'Electric Scissor Lift (1410mm wide)', platform: '13.8m', working: '15.8m', daily: '$190', weekly: '$500',   monthly: '$1,200', transport: '$185' },
    ],
  },
  {
    title: 'All Terrain Scissor Lifts (4WD Diesel)',
    rows: [
      { model: '1018RD', desc: 'Diesel Rough Terrain Scissor Lift', platform: '10m',   working: '12m',   daily: '$240', weekly: '$710',   monthly: '$2,000', transport: '$185' },
      { model: '1218RD', desc: 'Diesel Rough Terrain Scissor Lift', platform: '12.2m', working: '14.2m', daily: '$265', weekly: '$790',   monthly: '$2,100', transport: '$185' },
      { model: '1623RD', desc: 'Diesel Rough Terrain Scissor Lift', platform: '16.2m', working: '18.2m', daily: '$405', weekly: '$1,210', monthly: '$3,000', transport: '$275' },
    ],
  },
  {
    title: 'Diesel Articulating Boom Lifts',
    rows: [
      { model: 'AB15J', desc: 'Diesel Articulated Boom Lift', platform: '14.7m', working: '16.7m', daily: '$280', weekly: '$980',   monthly: '$2,600', transport: '$275' },
      { model: 'AB18J', desc: 'Diesel Articulated Boom Lift', platform: '18.3m', working: '20.3m', daily: '$360', weekly: '$1,135', monthly: '$2,700', transport: '$275' },
      { model: 'AB25J', desc: 'Diesel Articulated Boom Lift', platform: '24.6m', working: '26.6m', daily: 'POA',  weekly: 'POA',    monthly: 'POA',    transport: 'POA'  },
    ],
  },
];

const exclusions = [
  'All prices are exclusive of GST and are in NZD',
  'Insurance: 8.5% of hire charge applies',
  'Diesel: $4.50 per litre (if required)',
  'Transport rates apply to Greater Auckland / Bombay Hills / Albany — other regions POA',
  'Fuel surcharge: A variable fuel surcharge will be added to transport costs',
  'Scissor and Boom Terms & Conditions of Hire apply',
  'POA = Price on Application — please contact us for a quote',
  'Valid: 1 June 2026 – 30 September 2026',
];

// ── Layout constants ──────────────────────────────────────────────────────────

const PAGE_W = 841.89; // A4 landscape
const PAGE_H = 595.28;
const M = 36; // margin

// Column x positions and widths
const COL = {
  model:     { x: M,       w: 62  },
  desc:      { x: 98,      w: 168 },
  platform:  { x: 266,     w: 58  },
  working:   { x: 324,     w: 58  },
  daily:     { x: 382,     w: 64  },
  weekly:    { x: 446,     w: 72  },
  monthly:   { x: 518,     w: 78  },
  transport: { x: 596,     w: 210 },
};
const TABLE_RIGHT = PAGE_W - M;
const TABLE_W = TABLE_RIGHT - M;
const ROW_H = 26;
const HEADER_ROW_H = 30;

// ── Helpers ───────────────────────────────────────────────────────────────────

function cell(doc, text, x, w, y, h, opts = {}) {
  const {
    align = 'left',
    bold = false,
    fontSize = 8,
    color = BLACK,
    bg = null,
    pad = 6,
    valign = 'middle',
  } = opts;

  if (bg) {
    doc.save().rect(x, y, w, h).fill(bg).restore();
  }

  doc.font(bold ? 'Helvetica-Bold' : 'Helvetica')
     .fontSize(fontSize)
     .fillColor(color);

  const textY = valign === 'middle' ? y + (h - fontSize) / 2 : y + pad;
  doc.text(text, x + pad, textY, { width: w - pad * 2, align, lineBreak: false });
}

function hLine(doc, y, x1 = M, x2 = TABLE_RIGHT, color = BORDER) {
  doc.save().moveTo(x1, y).lineTo(x2, y).strokeColor(color).lineWidth(0.5).stroke().restore();
}

// ── Build PDF ─────────────────────────────────────────────────────────────────

const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0, info: {
  Title: 'Scissor and Boom Height Access — Hire Price List Jun–Sep 2026',
  Author: 'Scissor And Boom Height Access Ltd',
} });

doc.pipe(fs.createWriteStream(OUT));

// ── Header bar ────────────────────────────────────────────────────────────────
doc.rect(0, 0, PAGE_W, 70).fill(BLACK);
doc.rect(0, 70, PAGE_W, 4).fill(YELLOW);

// Logo
if (fs.existsSync(LOGO)) {
  doc.image(LOGO, M, 10, { height: 50 });
}

// Title
doc.font('Helvetica-Bold').fontSize(18).fillColor(WHITE)
   .text('HIRE PRICE LIST', 0, 18, { align: 'center' });
doc.font('Helvetica').fontSize(9).fillColor(YELLOW)
   .text('All prices exclude GST  ·  Valid: 1 June 2026 – 30 September 2026', 0, 40, { align: 'center' });

// ── Contact bar ───────────────────────────────────────────────────────────────
const CB_Y = 78;
doc.rect(0, CB_Y, PAGE_W, 22).fill(GREY);
doc.font('Helvetica-Bold').fontSize(8).fillColor(DGREY)
   .text('Contact: Aaron Clouston', M, CB_Y + 7);
doc.font('Helvetica').fontSize(8).fillColor(DGREY)
   .text('Phone: 021 362 017  |  0800 250 081', 200, CB_Y + 7)
   .text('Email: hire@scissorandboom.co.nz', 430, CB_Y + 7);

// ── Column header row ─────────────────────────────────────────────────────────
const CH_Y = 104;
doc.rect(M, CH_Y, TABLE_W, HEADER_ROW_H).fill(BLACK);

const headers = [
  { key: 'model',     label: 'Model' },
  { key: 'desc',      label: 'Description' },
  { key: 'platform',  label: 'Platform\nHeight' },
  { key: 'working',   label: 'Working\nHeight' },
  { key: 'daily',     label: 'Daily\nHire' },
  { key: 'weekly',    label: 'Weekly\nHire' },
  { key: 'monthly',   label: 'Monthly\nHire' },
  { key: 'transport', label: 'Transport Each Way\n(Greater Auckland / Albany)' },
];

headers.forEach(h => {
  const c = COL[h.key];
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(WHITE);
  const lines = h.label.split('\n');
  if (lines.length === 2) {
    doc.text(lines[0], c.x + 5, CH_Y + 6, { width: c.w - 10, align: 'center', lineBreak: false });
    doc.text(lines[1], c.x + 5, CH_Y + 16, { width: c.w - 10, align: 'center', lineBreak: false });
  } else {
    doc.text(h.label, c.x + 5, CH_Y + 11, { width: c.w - 10, align: 'center', lineBreak: false });
  }
});

// ── Sections & rows ───────────────────────────────────────────────────────────
let y = CH_Y + HEADER_ROW_H;

sections.forEach(section => {
  // Section title row
  doc.rect(M, y, TABLE_W, 20).fill(YELLOW);
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(BLACK)
     .text(section.title, M + 6, y + 6, { width: TABLE_W - 12 });
  y += 20;

  section.rows.forEach((row, i) => {
    const bg = i % 2 === 0 ? WHITE : GREY;
    doc.rect(M, y, TABLE_W, ROW_H).fill(bg);

    const isPOA = row.daily === 'POA';

    cell(doc, row.model,     COL.model.x,     COL.model.w,     y, ROW_H, { bold: true, fontSize: 8 });
    cell(doc, row.desc,      COL.desc.x,      COL.desc.w,      y, ROW_H, { fontSize: 7.5, color: DGREY });
    cell(doc, row.platform,  COL.platform.x,  COL.platform.w,  y, ROW_H, { align: 'center', fontSize: 8 });
    cell(doc, row.working,   COL.working.x,   COL.working.w,   y, ROW_H, { align: 'center', bold: true, fontSize: 8 });
    cell(doc, row.daily,     COL.daily.x,     COL.daily.w,     y, ROW_H, { align: 'center', bold: !isPOA, color: isPOA ? DGREY : BLACK, fontSize: 8 });
    cell(doc, row.weekly,    COL.weekly.x,    COL.weekly.w,    y, ROW_H, { align: 'center', bold: !isPOA, color: isPOA ? DGREY : BLACK, fontSize: 8 });
    cell(doc, row.monthly,   COL.monthly.x,   COL.monthly.w,   y, ROW_H, { align: 'center', bold: !isPOA, color: isPOA ? DGREY : BLACK, fontSize: 8 });
    cell(doc, row.transport, COL.transport.x, COL.transport.w, y, ROW_H, { align: 'center', color: isPOA ? DGREY : BLACK, fontSize: 8 });

    hLine(doc, y + ROW_H);
    y += ROW_H;
  });
});

// ── Exclusions box ────────────────────────────────────────────────────────────
y += 10;
const EX_H = exclusions.length * 13 + 20;
doc.rect(M, y, TABLE_W, EX_H).fill(GREY).strokeColor(BORDER).lineWidth(0.5).stroke();
doc.rect(M, y, TABLE_W, 16).fill('#e0e0e0');
doc.font('Helvetica-Bold').fontSize(8).fillColor(BLACK)
   .text('Exclusions & Clarifications', M + 8, y + 4);

exclusions.forEach((line, i) => {
  doc.font('Helvetica').fontSize(7.5).fillColor(DGREY)
     .text(`•  ${line}`, M + 10, y + 20 + i * 13, { width: TABLE_W - 20 });
});

// ── Footer ────────────────────────────────────────────────────────────────────
doc.rect(0, PAGE_H - 28, PAGE_W, 28).fill(BLACK);
doc.rect(0, PAGE_H - 28, PAGE_W, 3).fill(YELLOW);
doc.font('Helvetica').fontSize(7.5).fillColor(WHITE)
   .text('Scissor And Boom Height Access Ltd  |  P.O. Box 204136, Highbrook, Auckland 2161  |  scissorandboom.co.nz', 0, PAGE_H - 16, { align: 'center' });

doc.end();
console.log(`PDF written to ${OUT}`);
