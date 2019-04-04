const url = require('url')

module.exports = class URLShortener {
  constructor(urlString) {
    // Defines class properties.
    this.url = ''

    // 1. Validates URL.
    if (urlString)
      this.url = url.parse(urlString)
    // console.debug('URLShortener: Parsed URL', this.url)
    if (!this.url || !this.url.host)
      throw new Error("URL sent is not valid.")
    this.url = urlString
    // TODO: Try using this.url.href instead of req.body.url from here on
    //       to avoid different entries for equivalent URLs e.g. ...com vs ...com/
  }


}
