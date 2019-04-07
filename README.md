Author: Jorge Orpinel Perez <jorge@orpinel.com

## Demo URL shortener
> This demo app was developed to be deployed on Heroku.

It's a JSON microservice (over HTTP) to shorten URLs.

It creates a db.sqlite file to use as its database (so if the file is deleted, all previous data is lost).

### Specs:

GET /               Returns HTTP 404 with a useful error message

POST /              Expects JSON object `{url:"valid url"}` to create a short URL

GET /{permalink}    (callint the short URL) redirects to the original URL (HTTP 302)
                    This also increments an internal `requested` count for each permalink

> Certain conditions in each method above can return HTTO 402, 404, and 500 with helpful error messages from the app.
