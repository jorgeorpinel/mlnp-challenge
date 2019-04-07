const should = require('should') // See https://github.com/shouldjs/should.js

const URLShortener = require('../src/url-shortener')


describe('URLShortener', function() {

  describe('#constructor()', function() {
    it('should fail without arguments', function() {
      try {
        new URLShortener()
        should.fail(true, false,'Building a URLShortener without arguments succeeded!')
      }
      catch (error) {
        // Constructor threw Error, so test succeeded.
      }
    })
    it('should throw an error for invalid URLs', function() {
      (() => {
        new URLShortener('Malformed. url')
      }).should.throw()
    })
    it('should return a URLShortener object for valid URLs', function() {
      new URLShortener('http://url.com/').constructor.name.should.equal('URLShortener')
    })
  })

  describe('#new()', function() {
    it('should create a String that is 7 characters long (when URL is valid)', function() {
      permalink = new URLShortener('http://url.com/').new()
      permalink.constructor.name.should.equal('String')
      permalink.should.have.length(7)
    })
  })
})
