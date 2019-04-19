const bodyParser = require("body-parser");
const config = require("config");
const cors = require("cors");
const express = require("express");
const serveStatic = require("serve-static");
const sqlite = require("sqlite");
const SQL = require("sql-template-strings");

const app = express();
const port = 3000;

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
  await _.migrate({ force: "last" });
  return _
})();

app.use((req, res, next) => {
  const logs = [req.method, req.path];
  if (req.method !== "GET") {
    logs.push(req.body);
  }
  console.log(...logs);
  next();
});

// get all current checkins
app.get("/api/checkin", asyncCatch(async (req, res) => {
  res.send(await (await db).all("select * from pass_info"));
}));

// add new checkin
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

// cancel checkin
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

app.use(serveStatic("../js_client", { index: "passenger.html" }));

app.listen(port, () => console.log(`listening on port ${port}`));
