const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const randomstr = require('randomstring')

// TODO: Separate key business logic in pure javascript code (classes/functions) decoupled from express
//  and use vanilla mocha to test that.
const URLShortener = require('./src/url-shortener')


// Express and db bootstrap:

const app = express()
const port = process.env.PORT || 3000

// express.json() middleware expects and parses POST payloads as JSON.
app.use(express.json())

// TODO: Clean up db file periodically?
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

  // console.debug('req.body.url', req.body.url)
  // 1. Attempts to create new URLShortener object based on expected payload.
  if (req.body.url) {
    try {
      shortener = new URLShortener(req.body.url)
    } catch (err) {
      console.debug('err', err)
      res.status(404).json({error: err})
      return
    }
  } else {
    res.status(404).json({error: "No URL detected in request."})
    return
  }
  // At this point shortener should exist and be OK.

  let permalink = false

  // 2. Get short URL
  // TODO: Sanitize shortener.url! https://github.com/mapbox/node-sqlite3/wiki/API#statement
  db.get(`SELECT permalink FROM url_permalink WHERE url = '${shortener.url}'`, (err, row) => {
    console.debug(`SELECT permalink FROM url_permalink WHERE url = '${shortener.url}'`)
    console.debug('row', row)

    if(err) {
      console.error(err)
      res.status(500).json({error: err.message})
    }

    // 2.1 Check db for previously saved URL
    if (row && row.permalink) {
      // TODO: Return short URL if found.
      permalink = row.permalink
      console.info('Found permalink', permalink)
      res.json({short: `${req.hostname}${process.env.PORT?'':`:${port}`}/${permalink}`})
      return
    }

    // 2.2 Create new short URL
    // TODO: Check that new permalink doesn't exist yet in db! (Unlikely)
    permalink = randomstr.generate(7)
    console.debug('New permalink', permalink)

    // 3. Save pair to db
    db.run(`INSERT INTO url_permalink VALUES ('${shortener.url}', 1, '${permalink}', 0)`, (err) => {
      console.debug(`INSERT INTO url_permalink VALUES ('${shortener.url}', 1, '${permalink}', 0)`)
      if(err) {
        console.error(err)
        res.status(500).json({error: err.message})
      }
      // // TODO: Why is this.lastID undefined below?
      // console.debug('this.lastID', this.lastID)
      res.json({short: `${req.hostname}${process.env.PORT?'':`:${port}`}/${permalink}`})

      // TODO: Return text/plain depending on Accept header?
    })
  })
})

/**
 * HTTP GET /
 * 404 (Not Found) with useful error message
 * TODO: Render HTML page with usage info
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
  // const url = require('url')
  // console.debug(url.parse(req.url))
  let shortURL = req.url.split('/').pop()
  console.debug('shortURL', shortURL)

  // 1. Look for corresponding URL in db
  // TODO: Sanitize shortURL! https://github.com/mapbox/node-sqlite3/wiki/API#statement
  db.get(`SELECT url FROM url_permalink WHERE permalink = '${shortURL}'`, (err, row) => {
    console.debug(`SELECT url FROM url_permalink WHERE permalink = '${shortURL}'`)
    console.debug('row', row)

    if(err) {
      console.error(err)
      res.status(500).json({error: err.message})
    }

    // 2. Redirect or return 404
    if (row && row.url)
      res.redirect(row.url)
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
