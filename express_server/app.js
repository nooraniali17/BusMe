const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 3000;

// https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const connection = mysql.createConnection({
  multipleStatements: true,
  host: "127.0.0.1",
  user: "root",
  password: "password",
  database: "busme_db"
});

connection.connect(function (err) {
  if (err) {
    return console.error("error: " + err.message);
  }
  console.log("Connected to MySQL server!");
});

// get all current checkins
app.get("/", (req, res) => {
  try {
    const sql = "select * from pass_info";

    connection.query(sql, (err, results) => {
      if (err) {
        return res.sendStatus(500);
      }
      return res.send(results);
    });
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

// add new checkin
app.post("/", ({ body }, res) => {
  try {
    if (!body) {
      return res.sendStatus(400);
    }

    const sql = `
      insert into pass_info
        (num_pass, latitude, longitude, stop_name)
      values
        (${body.num_pass}, ${body.latitude}, ${body.longitude}, '${
      body.stop_name
      }')
    `;

    connection.query(sql, (err, result) => {
      if (err) {
        console.log("error " + err);
        return res.sendStatus(500);
      }
      return res.sendStatus(204);
    });
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

// cancel checkin
app.post('/cancelRequest', ({ body }, res) => {
  try {
    if (!body) {
      return res.sendStatus(400);
    }
    const sql = `delete from pass_info where stop_name = "Calvary First Church"`;

    connection.query(sql, function (err, result) {
      if (err) {
        console.log("error " + err);
        return res.sendStatus(500);
      }
      return res.sendStatus(204);
    });
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
