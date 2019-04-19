-----
-- Up
-----

CREATE TABLE pass_info (
  id          INTEGER PRIMARY KEY,
  num_pass    INTEGER,
  latitude    FLOAT,
  longitude   FLOAT,
  stop_name   TEXT
);

-----
-- Down
-----

DROP TABLE pass_info;
