from datetime import datetime, timedelta
from uuid import UUID

from config2.config import config
from pony.orm import Database, Json, Optional, PrimaryKey, Required, Set

__all__ = [
    "User",
    "Organization",
    "Driver",
    "Route",
    "Stop",
    "Timetable",
    "Rider",
    "Checkin",
    "Time",
]

db = Database(**config.database)


class User(db.Entity):  # type: ignore
    id = PrimaryKey(int, auto=True)
    oidc_id = Required(str)


class Organization(db.Entity):  # type: ignore
    id = PrimaryKey(UUID, auto=True)
    name = Optional(str)
    primary_email = Optional(str)
    support_email = Optional(str)
    routes = Set("Route")


class Driver(User):  # type: ignore
    routes = Set("Route", reverse="drivers")
    last_route = Optional("Route", reverse="last_driver")


class Route(db.Entity):  # type: ignore
    id = PrimaryKey(int, auto=True)
    organization = Required(Organization)
    drivers = Set(Driver, reverse="routes")
    last_driver = Optional(Driver, reverse="last_route")
    timetable = Set("Timetable")
    name = Required(str)
    device_pair = Optional(UUID)


class Stop(db.Entity):  # type: ignore
    id = PrimaryKey(int, auto=True)
    route_stops = Set("Timetable")
    checkins = Set("Checkin")
    name = Required(str)
    longitude = Required(float)
    latitude = Required(float)
    gmaps_query = Optional(Json)


class Timetable(db.Entity):  # type: ignore
    id = PrimaryKey(int)
    route = Required(Route)
    stop = Required(Stop)
    next_stop = Required("Timetable", reverse="prev_stop")
    prev_stop = Optional("Timetable", reverse="next_stop")
    expected_duration = Required(timedelta)
    last_time = Optional("Time")


class Rider(User):  # type: ignore
    checkin = Optional("Checkin")
    party_size = Required(int)


class Checkin(db.Entity):  # type: ignore
    id = PrimaryKey(int, auto=True)
    rider = Required(Rider)
    stop = Required(Stop)
    start_time = Required(datetime, default=lambda: datetime.now())
    end_time = Optional(datetime)
    fulfilled = Required(bool, default=False)


class Time(db.Entity):  # type: ignore
    id = PrimaryKey(datetime, default=lambda: datetime.now(), auto=True)
    duration = Optional(timedelta)
    average_duration = Optional(timedelta)
    timetable = Required(Timetable)


db.generate_mapping(create_tables=True)
