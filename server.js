require('dotenv').config();

const dns = require('dns');
const URL = require('url').URL;
const express = require('express');
const cors = require('cors');
const app = express();

const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

const { Schema, model } = mongoose;

const urlSchema = new Schema({
  originalURL: String, // String is shorthand for {type: String}
  shortenedURL: String,
});

const URLL = model('URL', urlSchema);

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

let parseUrl = (url) => {
  let url_parsed = url.split('?')[0]
  return url_parsed
}


// let middleware = (req, res, next) => {

//   let url = parseUrl(req.body.url)
//   dns.lookup(url, (err, hostname, service) => {
//     if (err) {
//       console.log(err)
//       return res.send({ error: 'Invalid URL' })
//     }
//     next()
//   })
// }

// app.post('/api/shorturl', middleware, function (req, res) {

//   res.send({ original_url: req.body.url, short_url: 9204 })
// });

app.post('/api/shorturl', (req, res, next) => {

  const originalURL = req.body.url;
  const urlObject = new URL(originalURL);

  dns.lookup(urlObject.hostname, (err, address, family) => {
    if (err) {

      res.json({ error: "Invalid URL" });
    } else {
      var shortenedURL = Math.floor(Math.random() * 100000).toString();

      var data = new URLL({
        originalURL: originalURL,
        shortenedURL: shortenedURL
      });

      data.save(function (err, data) {
        if (err) {
          return console.error(err);
        }
      });

      res.json({ originalURL: originalURL, short_url: shortenedURL })
    };
  });
});

app.get('/api/shorturl/:short_url', async (req, res, next) => {

  let url = await URLL.findOne({ shortenedURL: req.params.short_url })
  if (!url) return res.send({ error: 'invalid url' })
  res.redirect(url.originalURL)
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
