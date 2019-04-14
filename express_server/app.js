const express = require("express");
const app = express();
const port = 3000;
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");

// setup cors
app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "password",
  database: "busme_db"
});

connection.connect(function(err) {
  if (err) {
    return console.error("error: " + err.message);
  }
  console.log("Connected to MySQL server!");
});

app.get("/", (req, res) => {
  try {
    const sql = "select * from pass_info";

    connection.query(sql, function(err, results) {
      if (err) {
        return res.sendStatus(500);
      }
      return res.send(results);
    });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

app.post("/", (req, res) => {
  try {
    const { body } = req;

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

    connection.query(sql, function(err, result) {
      if (err) {
        console.log("error " + err);
        return res.sendStatus(500);
      }
      return res.sendStatus(204);
    });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
