-----
-- Up
-----

CREATE TABLE stop (
  id          INTEGER PRIMARY KEY,
  -- where /place/details/json?placeid={} would return the stop name
  placeid     TEXT UNIQUE
);

CREATE TABLE checkin (
  id          INTEGER PRIMARY KEY,
  name        TEXT,     -- party name for driver to match riders by
  passengers  INTEGER,  -- number of passengers in checkin
  fk_stop     INTEGER,  -- stop logged in to
  cancel      BLOB,     -- cancel token
  CHECK (passengers BETWEEN 0 AND 10),
  FOREIGN KEY(fk_stop) REFERENCES stop(id)
);

-----
-- Down
-----

DROP TABLE checkin;
DROP TABLE stop;
