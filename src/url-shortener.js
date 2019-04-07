const url = require('url')
const randomstr = require('randomstring')
// TODO: Should probably include the db functionality too...


module.exports = class URLShortener {

  /**
   * Constructs shortener with URL string and validates it.
   * @param urlString
   */
  constructor(urlString) {

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

  /**
   * Shorten URL (set at constructor)
   * Returns short URL or false if there is a problem URLShortener doesn't have a valid URL to shorten.
   * TODO: @throws...
   */
  new() {
    if ('' == this.url)
      throw new Error("This object doesn't have a valid URL to shorten.")  // See `constructor`

    // 2.2 Create new short URL
    return randomstr.generate(7)
  }
}
