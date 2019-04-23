-----
-- Up
-----

CREATE TABLE pass_info (
  id          INTEGER PRIMARY KEY,
  num_pass    INTEGER,
  latitude    FLOAT,
  longitude   FLOAT,
  stop_name   TEXT UNIQUE
);

-----
-- Down
-----

DROP TABLE pass_info;
