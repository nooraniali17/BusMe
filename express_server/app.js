const express = require("express");
const app = express();
const port = 3000;
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");

// setup cors which allows clients and
// servers to communicate when on different domains
app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());

// credentials needed to connect to database on Kurt's machine
const connection = mysql.createConnection({
  multipleStatements: true,
  host: "127.0.0.1",
  user: "root",
  password: "password",
  database: "busme_db"
});

// function to check for errors
connection.connect(function(err) {
  if (err) {
    return console.error("error: " + err.message);
  }
  console.log("Connected to MySQL server!");
});

// retrieves information from the database
app.get("/", (req, res) => {
  try {
    // this sql code will grab all the data from the
    // table in the database named pass_info
    const sql = "select * from pass_info";

    // sends sql command to database and returns results
    connection.query(sql, function(err, results) {
      if (err) {
        return res.sendStatus(500);
      }
      return res.send(results);
    });
    // catch block needed to elegantly exit program
    // if something goes wrong
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

// sends and saves information to the database
app.post("/", (req, res) => {
  try {
    const { body } = req;

    if (!body) {
      return res.sendStatus(400);
    }

    // creating sql command to put values in the
    // correct columns of database
    const sql = `
      insert into pass_info
        (num_pass, latitude, longitude, stop_name)
      values
        (${body.num_pass}, ${body.latitude}, ${body.longitude}, '${
      body.stop_name
    }')
    `
    sql = `delete from pass_info where stop_name = "Calvary First Church";`
    ;

    // catch block needed to elegantly exit program
    // if something goes wrong
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

// shows us connection status
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
