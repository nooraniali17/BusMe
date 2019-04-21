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

app.post("/updatePassengerInformation", (req, res) => {
  try{
    const sql = ""

  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
})

// sends and saves information to the database
app.post("/", (req, res) => {
  try {
    // destructuring request EX: req.body.stop_name
    const { body } = req;

    if (!body) {
      return res.sendStatus(400);
    }

    const existsSql  = `select * from pass_info where stop_name = '${body.stop_name}'`;

    connection.query(existsSql, function(err, result) {
      if (err) {
        console.log("error " + err);
        return res.sendStatus(500);
      }
      const exists = result[0];

      if (exists) {
        // do an update here
        // body.picked_up is not in database, send numpass and picked up to API, do math and send passengersWaiting later
        let passengersWaiting = body.num_pass - body.picked_up;

        const updateSQL =
          `update pass_info 
            set num_pass = ${passengersWaiting} 
            where stop_name = '${body.stop_name}'`;

            connection.query(updateSQL, function(err, result) {
              if(err) {
                console.log("error" + err);
                return res.sendStatus(500);
              }
              return res.sendStatus(204);
            });
      } 
      else {
        const insertSql = `
          insert into pass_info
            (num_pass, latitude, longitude, stop_name)
          values
            (${body.num_pass}, ${body.latitude}, ${body.longitude}, '${
          body.stop_name}')
        `;

        connection.query(insertSql, function(err, result) {
          if (err) {
            console.log("error " + err);
            return res.sendStatus(500);
          }
          return res.sendStatus(204);
        });
      }
    });
    // creating sql command to put values in the
    // correct columns of database
  // }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

app.post('./cancelRequest', (req, res) => {
  try {
    const { body } = req;

    if (!body) {
      return res.sendStatus(400);
    }  
    const sql = `delete from pass_info where stop_name = "Calvary First Church"`;

    connection.query(sql, function(err, result) {
      if(err) {
        console.log("error " + err);
        return res.sendStatus(500);
      }
      return res.sendStatus(204);
    });
  }
  catch(e) {
    console.log(e);
    res.sendStatus(500);
  }
});

// shows us connection status
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
