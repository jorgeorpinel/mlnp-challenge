const express = require('express')
const sqlite3 = require('sqlite3').verbose()

const URLShortener = require('./src/url-shortener')


// Express and db bootstrap:

const app = express()
const port = process.env.PORT || 3000

// express.json() middleware expects and parses POST payloads as JSON.
app.use(express.json())

// NOTE: db file may be truncated on each deploy on PaaS clouds (e.g. Heroku)
const db = new sqlite3.Database('db.sqlite')

// Sets up db schema if needed (first time the app runs on this machine).
db.run('CREATE TABLE IF NOT EXISTS url_permalink (url TEXT, saved INTEGER, permalink TEXT, requested INTEGER)')

// @var URLShortener
let shortener


/*
 * POST /
 * Accepts a long URL and provides a short one.
 * Expected JSON payload input: {url:"Valid full URL."}
 * Returns JSON object with short URL: {url: `${HOST}/short`}
 */
app.post('/', (req, res) => {
  // 0. Gets POST data.
  // console.debug('req.body', req.body)

  // 1. Creates new URL shortener.
  // console.debug('req.body.url', req.body.url)
  if (req.body.url) {
    try {
      shortener = new URLShortener(req.body.url)
    } catch (err) {
      // console.debug('new URLShortener threw', err.message)
      res.status(402).json({error: err.message})
      return
    }
  } else {
    res.status(402).json({error: "No URL detected in request."})
    return
  }
  // NOTE: At this point we assume the URL is valid and the `shortener` object is healthy.

  let permalink = false

  // 2. Get short URL
  db.get('SELECT permalink FROM url_permalink WHERE url = ?', shortener.url, (err, row) => {
    // console.debug('SELECT permalink FROM url_permalink WHERE url = ?', shortener.url)
    // console.debug('row', row)
    if(err) {
      console.error(err)
      res.status(500).json({error: `DB error: ${err.message}`})
    }

    // Checks db for previously saved URL. Returns short URL if found.
    if (row && row.permalink) {
      permalink = row.permalink
      // console.debug('Found permalink', permalink)
      res.json({short: `${req.hostname}${process.env.PORT?'':`:${port}`}/${permalink}`})
      return
    }

    // Creates new short URL.
    permalink = shortener.new()
    // TODO: Check that new permalink doesn't exist yet in db. (Unlikely)
    // console.debug('New permalink', permalink)

    // 3. Save pair to db
    db.run('INSERT INTO url_permalink VALUES (?, 1, ?, 0)', [shortener.url, permalink], (err) => {
      // console.debug('INSERT INTO url_permalink VALUES (?, 1, ?, 0)', [shortener.url, permalink])
      if(err) {
        console.error(err)
        res.status(500).json({error: `DB error: ${err.message}`})
      }
      res.json({short: `${req.hostname}${process.env.PORT?'':`:${port}`}/${permalink}`})
    })
  })
})

/**
 * HTTP GET /
 * 404 (Not Found) with useful error message
 */
app.get('/', function(req, res){
  res.status(404).json({error: "Please POST JSON object with 'url' string property."});
});

/*
 * GET /{anything}
 * Redirects to corresponding long URL.
 */
app.get(/\/..*/, (req, res) => {
  // 0. Get permalink from requested URL/path
  // console.debug(req.url)
  let shortURL = req.url.split('/').pop()
  // console.debug('shortURL', shortURL)

  // 1. Looks for corresponding URL in db.
  // TODO: Sanitize shortURL! https://github.com/mapbox/node-sqlite3/wiki/API#statement
  db.get('SELECT rowid as id, url, requested FROM url_permalink WHERE permalink = ?', shortURL, (err, row) => {
    // console.debug('SELECT url FROM url_permalink WHERE permalink = ?', shortURL)
    // console.debug('row', row)

    if(err) {
      console.error(err)
      res.status(500).json({error: `DB error: ${err.message}`})
    }

    // 2. Increments requested col and redirects, or returns 404.
    if (row && row.url) {
      db.run('UPDATE url_permalink SET requested = ? WHERE rowid = ?', [(row.requested+1), row.id], (err) => {
        // console.debug('UPDATE url_permalink SET requested = ? WHERE rowid = ?', [++row.requested, row.id])
        // console.debug(shortURL, 'request count:', (row.requested+1))
        if(err) {
          console.error(err)
          res.status(500).json({error: `DB error: ${err.message}`})
        }

        res.redirect(row.url)
      })
    }
    else
      res.status(404).json({error: `Sorry, we don't recognize that URL.`});
  })
})

// Starts server app.
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

/**
 * Express catch-all 5xx errors
 * to send JSON error response bodies by efault
 */
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).json({error: err.message})
})
