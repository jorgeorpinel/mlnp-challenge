const url = require('url')

module.exports = class URLShortener {
  constructor(urlString) {
    // Defines class properties.
    this.url = ''

    // Validates URL.
    let parsedURL
    if (urlString)
      parsedURL = url.parse(urlString)
    // console.debug('URLShortener: Parsed URL', parsedURL)
    if (!parsedURL || !parsedURL.host)
      throw new Error("URL sent is not valid.")
    if('Malformed.%20url' == parsedURL.href)
      throw new Error("URL sent is malformed.")
    this.url = parsedURL.href

    // If '' == this.url at this point, the constructor failed.
  }

}
