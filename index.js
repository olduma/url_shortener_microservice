require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({ extended: true }));

// In-memory database for storing URLs and their corresponding short codes
const urlDatabase = {};
let shortCode = 1;

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  // Check if the URL is valid
  const isValidUrl = isValidURL(originalUrl);

  if (!isValidUrl) {
    return res.json({ error: 'Invalid URL' });
  }

  // Generate a short code and store the mapping
  const shortUrl = shortCode++;
  urlDatabase[shortUrl] = originalUrl;

  res.json({ original_url: originalUrl, short_url: shortUrl });
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'Short URL not found' });
  }
});

function isValidURL(str) {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // Protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // Domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // Or IP (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // Port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // Query string
    '(\\#[-a-z\\d_]*)?$',
    'i'
  );
  return !!pattern.test(str);
}

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
