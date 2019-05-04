const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const serveStatic = require('serve-static');

/**
 * Wrap middleware function with default error handling, so that there is no
 * need to add try-catch blocks manually.
 *
 * Equivalent of:
 *
 * ```js
 * try {
 *  await fn(...args);
 * } catch (err) {
 *  console.error(err);
 *  res.sendStatus(500);
 * }
 * ```
 *
 * @param fn Async function to wrap.
 */
function asyncCatch (fn) {
  return (req, res, ...args) => Promise.resolve(fn(req, res, ...args))
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
}

const app = express();

// logging (e.g. `::ffff:127.0.0.1 - GET / HTTP/1.1 304 - - 9.584 ms`)
app.use(morgan('short'));

// https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// register all endpoints
for (const [path, middleware] of Object.entries(require('./endpoints'))) {
  for (const [method, action] of Object.entries(middleware)) {
    app[method](path, asyncCatch(action));
  }
}

// proxy static files to avoid multi origin trouble during local development
app.use(serveStatic('../js_client', {
  index: 'passenger.html',
  extensions: ['html']
}));

module.exports = app;
