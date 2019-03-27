const http = require('http')
const express = require('express')
// TODO: Use SQLite as db

const app = express()

// app.use('/static', express.static(path.join(__dirname, 'static')))

// TODO: app.post /
app.get('/', (req, res) => {
  console.debug('req', req)
  console.debug('res', res)

  // TODO: Get POST data

  // TODO: Validate URL

  // TODO: Check db for pre-existing URL
  //  Return short URL if found.

  // TODO: Create new short URL
  //  Save pair to db
  //  Return short URL
})

server = http.createServer()
server.on('request', app)

// TODO: Start server
console.debug('app', app)
console.debug('server', server)

// TODO: Use basic mocha tests
