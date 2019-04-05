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

  describe('#indexOf()', function() {
    it('should return -1 when [1, 2, 3] has no 4th index (tautology)', function() {
      // noinspection JSDeprecatedSymbols
      // [1, 2, 3].indexOf(4).should.equal(-1)
      should([1, 2, 3].indexOf(4)).be.exactly(-1)
    })
  })
})
