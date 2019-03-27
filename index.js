const http = require('http')
const express = require('express')

const app = express()

// app.use('/static', express.static(path.join(__dirname, 'static')))

app.get('/', (req, res) => {
      console.debug('req', req)
      console.debug('res', res)
    }
)

server = http.createServer()
server.on('request', app)

console.debug('app', app)
console.debug('server', server)