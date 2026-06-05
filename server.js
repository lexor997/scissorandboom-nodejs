const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

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
