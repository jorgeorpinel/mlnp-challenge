const should = require('should') // See https://github.com/shouldjs/should.js

describe('Mocha', function() {
  describe('#indexOf()', function() {
    it('should return -1 when [1, 2, 3] has no 4th index (tautology)', function() {
      // noinspection JSDeprecatedSymbols
      // [1, 2, 3].indexOf(4).should.equal(-1)
      should([1, 2, 3].indexOf(4)).be.exactly(-1)
    })
  })
})
