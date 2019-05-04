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
  active      BOOLEAN DEFAULT TRUE,  -- is this an active checkin?
  created     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (passengers BETWEEN 0 AND 10),
  CHECK (active IN (0, 1)),
  FOREIGN KEY(fk_stop) REFERENCES stop(id)
);

CREATE TABLE driver (
  id          INTEGER PRIMARY KEY,
  lng         REAL,
  lat         REAL
);
INSERT INTO driver VALUES (1, 0, 0); -- temporary

-----
-- Down
-----

DROP TABLE driver;
DROP TABLE checkin;
DROP TABLE stop;
