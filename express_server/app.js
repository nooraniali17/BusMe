const bodyParser = require("body-parser");
const config = require("config");
const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const serveStatic = require("serve-static");
const sqlite = require("sqlite");
const SQL = require("sql-template-strings");

/**
 * Wrap middleware function with default error handling, so that there is no
 * need to add try-catch blocks manually.
 * 
 * Equivalent of:
 * 
 * ```js
 * try {
 *  await fn(...args);
 * } catch (e) {
 *  console.log(err);
 *  res.sendStatus(500);
 * }
 * ```
 * 
 * @param fn Async function to wrap.
 */
function asyncCatch(fn) {
  return (req, res, ...args) => Promise.resolve(fn(req, res, ...args))
    .catch(err => {
      console.log(err);
      res.sendStatus(500);
    });
}

if (!config.has("db")) {
  throw new Error("Please specify a file to use as sqlite database.");
}

const db = (async () => {
  const _ = await sqlite.open(config.get("db"));
  // execute migration script in `migrations/*`, in our case it's just to 
  // initialize the database in general.
  await _.migrate({ force: "last" });
  return _
})();

const app = express();

// logging (e.g. `::ffff:127.0.0.1 - GET / HTTP/1.1 304 - - 9.584 ms`)
app.use(morgan("short"));

// https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// get all current checkins (table dump)
app.get("/api/checkin", asyncCatch(async (req, res) => {
  res.send(await (await db).all("select * from pass_info"));
}));

/**
 * Add new checkin.
 * 
 * schema: dict:
 *  num_pass: int: number of passengers (1..10).
 *  latitude, longitude: float:
 *    geolocation of stop (should be handled by gmaps).
 *  stop_name: str: google maps query for the stop.
 * 
 * returns: int: id for future reference in POST /api/checkin/cancel
 */
app.post("/api/checkin", asyncCatch(async ({ body = {} }, res) => {
  const params = [
    "num_pass",
    "latitude",
    "longitude",
    "stop_name"
  ].map(k => body[k]);

  if (!params.every(v => v)) {
    console.log("not all params are filled,", params);
    return res.sendStatus(400);
  }

  const [pass, lat, lng, stop] = params;
  const { lastID } = await (await db).run(SQL`
    insert into pass_info
      (num_pass, latitude, longitude, stop_name)
    values (${pass}, ${lat}, ${lng}, ${stop})
  `)

  return res.send({ id: lastID });
}));

/**
 * Cancel checkin.
 * 
 * schema: dict:
 *  id: int:
 *    ID to delete (should be kept from the return result of POST /api/checkin)
 */
app.post("/api/checkin/cancel", asyncCatch(async ({ body = {} }, res) => {
  if (!body.id) {
    console.log("no id provided, instead got", body);
    return res.sendStatus(400);
  }

  await (await db).run(SQL`
    delete from pass_info
    where
      id = ${body.id}
  `);

  return res.sendStatus(204);
}));

// proxy static files to avoid multi origin trouble during local development
app.use(serveStatic("../js_client", { index: "passenger.html" }));

module.exports = app;
