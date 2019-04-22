const bodyParser = require("body-parser");
const config = require("config");
const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const schedule = require("node-schedule");
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
 *  console.error(err);
 *  res.sendStatus(500);
 * }
 * ```
 * 
 * @param fn Async function to wrap.
 */
function asyncCatch(fn) {
  return (req, res, ...args) => Promise.resolve(fn(req, res, ...args))
    .catch(err => {
      console.error(err);
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
 * Get passenger count at a stop.
 * 
 * @param stop_name Google maps query of which stop to get count for.
 * @returns Number of passengers, or `undefined` if the stop doesn't exist.
 */
async function getPassengerCountAt(stop_name) {
  const data = await (await db).get(SQL`
    select num_pass from pass_info
    where
      stop_name = ${stop_name}
    limit 1
  `);

  if (data) {
    return data.num_pass;
  }
}

/**
 * Set number of passengers at `stop_name` to `num_pass` passengers.
 */
async function setPassengerCount(stop_name, num_pass) {
  return (await db).run(SQL`
    update pass_info
      set num_pass = ${num_pass}
      where stop_name = ${stop_name}
  `);
}

/**
 * Pick user up.
 * 
 * schema: dict:
 *  picked_up: int: number of passengers that got picked up.
 *  stop_name: str: google maps query for the stop.
 */
app.post("/api/pickup", asyncCatch(async ({ body = {} }, res) => {
  const { picked_up, stop_name } = body;
  if (!picked_up || !stop_name) {
    console.log("not all params are filled;", picked_up, stop_name);
    return res.sendStatus(400);
  }

  const waitingPassCount = await getPassengerCountAt(stop_name);
  if (!waitingPassCount) {
    console.log(`trying to pick up at a stop (${stop_name}) that doesn't have any passengers`);
    return res.sendStatus(400);
  } else if (picked_up <= 0 || picked_up > waitingPassCount) {
    console.log(`trying to pick up a weird amount of passengers (${picked_up})`);
    return res.sendStatus(400);
  }

  await setPassengerCount(stop_name, waitingPassCount - picked_up);

  return res.sendStatus(204);
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
    console.log("not all params are filled;", params);
    return res.sendStatus(400);
  }

  const [pass, lat, lng, stop] = params;

  if (pass <= 0 || pass > 10) {
    console.log("passenger count not between 1 and 10, got", pass, "instead");
    return res.sendStatus(400);
  }

  // calculate existing passenger count after this checkin
  const numAtStop = ((await getPassengerCountAt(stop)) || 0) + pass;

  // update values
  await (await db).run(SQL`
    insert or replace into pass_info
      (num_pass, latitude, longitude, stop_name)
    values (${numAtStop}, ${lat}, ${lng}, ${stop})
  `);

  return res.sendStatus(204);
}));

/**
 * Cancel checkin.
 * 
 * schema: dict:
 *  id: int:
 *    ID to delete (should be kept from the return result of POST /api/checkin)
 */
app.post("/api/checkin/cancel", asyncCatch(async ({ body = {} }, res) => {
  const { stop_name, num_pass } = body;
  if (!stop_name || !num_pass) {
    console.log("no stop name or passenger count provided, instead got", body);
    return res.sendStatus(400);
  }

  const numAtStop = Math.max(
    ((await getPassengerCountAt(stop_name)) || 0) - num_pass, 0
  );
  await setPassengerCount(stop_name, numAtStop);
  return res.sendStatus(204);
}));

// proxy static files to avoid multi origin trouble during local development
app.use(serveStatic("../js_client", { index: "passenger.html" }));

module.exports = app;

// and schedule a reset of all stops every day at midnight
const job = schedule.scheduleJob({ hour: 0, minute: 0 }, async () => {
  console.log("resetting stored stops.");
  (await db).run("delete from pass_info");
});
