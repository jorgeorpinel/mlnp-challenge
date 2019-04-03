const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const randomstr = require('randomstring')

// TODO: Separate key business logic in pure javascript code (classes/functions) decoupled from express and use vanilla mocha to test that.

const app = express()
const port = process.env.PORT || 3000

// express.json() middleware expects and parses POST payloads as JSON.
app.use(express.json())
// app.use('/static', express.static(path.join(__dirname, 'static')))

// const db = new sqlite3.Database(':memory:')
const db = new sqlite3.Database('db.sqlite')

db.run('CREATE TABLE IF NOT EXISTS url_permalink (url TEXT, saved INTEGER, permalink TEXT, requested INTEGER)')

/*
 * POST /
 * Accepts a long URL and provides a short one.
 * Expected JSON payload input: {url:"Valid full URL."}
 * Returns JSON object with short URL: {url: `${HOST}/short`}
 */
app.post('/', (req, res) => {

  // 0. Get POST data
  // console.debug('req.body', req.body)

  // 1. Validate URL from payload
  // console.debug('req.body.url', req.body.url)
  let longURL = false
  const url = require('url')
  if (req.body.url)
    longURL = url.parse(req.body.url)
  console.debug('Parsed URL', longURL)
  if (!longURL || !longURL.host) {
    res.status(400).json({error: "No URL detected in request."})
    return
  }
  // TODO: Try using longURL.href instead of req.body.url from here on
  //       to avoid different entries for equivalent URLs e.g. ...com vs ...com/

  // db.serialize(() => {
    let permalink = false

    // 2. Get short URL
    db.get(`SELECT permalink FROM url_permalink WHERE url = '${req.body.url}'`, (err, row) => {
      console.debug(`SELECT permalink FROM url_permalink WHERE url = '${req.body.url}'`)
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
      // TODO: Sanitize longURL! https://github.com/mapbox/node-sqlite3/wiki/API#statement
      db.run(`INSERT INTO url_permalink VALUES ('${req.body.url}', 1, '${permalink}', 0)`, (err) => {
        console.debug(`INSERT INTO url_permalink VALUES ('${req.body.url}', 1, '${permalink}', 0)`)
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
  // })
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

// Start server app
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

/**
 * Send JSON response for unexpected 5xx errors.
 */
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).json({error: err.message})
})

// // From https://stackoverflow.com/a/42928185/761963
// process.on('SIGINT', () => {
//   db.close()
//   // server.close()
// })
