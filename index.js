const express = require('express')
// TODO: Use SQLite as db

const app = express()
const port = process.env.PORT || 3000

// app.use('/static', express.static(path.join(__dirname, 'static')))

/*
 * POST /
 * Accepts a long URL and provides a short one.
 * Expected JSON payload input: {url:"Valid full URL."}
 * Returns JSON object with short URL: {url: `${HOST}/short`}
 */
app.post('/', (req, res) => {
  // console.debug('req.headers', req.headers)

  // 0. Get POST data
  // console.debug('req.body', req.body)

  // console.debug('req.params', req.params)
  // console.debug('req.query', req.query)

  // 1. Validate URL from payload
  // console.debug('req.body.url', req.body.url)
  let longURL = false
  const url = require('url')
  if (req.body.url)
    longURL = url.parse(req.body.url)
  // console.debug('Parsed URL', longURL)
  if (!longURL || !longURL.host) {
    res.status(400)
    res.json({error: "No URL detected in request."})
    return
  }
  // const URL = require('url').URL
  // const myURL = new URL(req.body.url)
  // console.debug('myURL', myURL)
  // // ...Catch TypeError [ERR_INVALID_URL]

  // TODO: 2. Check db for pre-existing URL
  //  Return short URL if found.

  // TODO: 3. Create new short URL
  //  Save pair to db
  //  Return short URL to text/plain
  //  + or text/html depending on Accept header

  // console.debug('res.url', res.url)
  // console.debug('res._parsedUrl', res._parsedUrl)
  // console.debug('res.statusCode', res.statusCode)

  res.send('WIP POST')
})

app.get('/', function(req, res){
  res.status(404).json({error: "Permalink required (in the request URL path)."}); // <== YOUR JSON DATA HERE
});

/*
 * TODO: GET /{anything}
 * Redirects to corresponding long URL.
 */
app.get(/\/..*/, (req, res) => {
  // TODO: Get path from requested URL
  console.debug(req.url)

  // TODO: Sanitize and look for corresponding URL in db

  // TODO: Redirect or return 404
  // res.redirect(

  res.send('WIP GET')
})

// Start server app
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

// TODO: Use basic mocha tests

/**
 * Send JSON response with any 5xx errors.
 */
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).json({error: err.message})
})