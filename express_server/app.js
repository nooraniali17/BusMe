const bodyParser = require("body-parser");
const config = require("config");
const cors = require("cors");
const express = require("express");
const serveStatic = require("serve-static");
const sqlite = require("sqlite");
const SQL = require("sql-template-strings");

const app = express();

/**
 * Wrap middleware function with error handling, so that there is no need to
 * add try-catch blocks manually.
 * 
 * @param fn Async function to wrap.
 */
function asyncCatch(fn) {
  return (req, res) => Promise.resolve(fn(req, res)).catch(err => {
    console.log(err);
    res.sendStatus(500);
  })
}

// https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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

// add endpoint logging (eg `GET /endpoint`, or `POST /endpoint { key: data }`)
// this has no effect on the endpoints themselves.
app.use((req, res, next) => {
  const logs = [req.method, req.path];
  // don't include body if it is a GET request
  if (req.method !== "GET") {
    logs.push(req.body);
  }
  console.log(...logs);
  next();
});

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
    return res.sendStatus(400);
  }

  await (await db).run(SQL`
    delete from pass_info
    where
      id = ${body.id}
  `);

  return res.sendStatus(204);
}));

// proxy static files to avoid multi origin trouble
app.use(serveStatic("../js_client", { index: "passenger.html" }));

module.exports = app;
