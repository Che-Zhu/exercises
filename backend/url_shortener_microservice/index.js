require('dotenv').config();
const express = require('express');
const dns = require('dns');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

let urlData = {};

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.use(express.json());
app.use(express.urlencoded());

app.post('/api/shorturl', function(req, res) {
  const original_url = req.body["url"];

  const url_host = new URL(original_url).host;
  
  dns.lookup(url_host, (err, address, family) => {
    console.log(original_url);
    if (err) {
      console.log(err, address);
      res.json({
        error: "invalid url"
      });
    } else {
      const short_url = Object.values(urlData).length;

      urlData[short_url] = original_url;
    
      res.json({
        original_url: original_url,
        short_url: short_url
      });
    }
  })
})

app.get('/api/shorturl/:short_url', function(req, res) {
  res.redirect(urlData[req.params["short_url"]]);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
