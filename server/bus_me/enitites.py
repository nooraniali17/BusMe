from datetime import datetime, timedelta
from uuid import UUID, uuid4

from config2.config import config
from pony.orm import Database, Json, Optional, PrimaryKey, Required, Set

db = Database(**config.database)


class User(db.Entity):
    id = PrimaryKey(int, auto=True)
    user_login = Optional("UserLogin")
    first_name = Required(str)
    last_name = Optional(str, nullable=True)
    confirmed = Required(bool, default=False)
    confirm_token = Optional(UUID)


class UserLogin(db.Entity):
    user = PrimaryKey(User)
    email = Required(str)
    password_hash = Required(str)
    salt = Required(str)


class Organization(db.Entity):
    id = PrimaryKey(int, auto=True)
    name = Optional(str)
    primary_email = Optional(str)
    support_email = Optional(str)
    members = Set("Admin")
    routes = Set("Route")


class Admin(User):
    organization = Required(Organization)


class Driver(Admin):
    routes = Set("Route", reverse="drivers")
    last_route = Optional("Route", reverse="last_driver")


class Route(db.Entity):
    id = PrimaryKey(int, auto=True)
    organization = Required(Organization)
    drivers = Set(Driver, reverse="routes")
    last_driver = Optional(Driver, reverse="last_route")
    timetable = Set("Timetable")
    name = Required(str)
    device_pair = Optional(UUID)


class Stop(db.Entity):
    id = PrimaryKey(int, auto=True)
    route_stops = Set("Timetable")
    checkins = Set("Checkin")
    name = Required(str)
    longitude = Required(float)
    latitude = Required(float)
    gmaps_query = Optional(Json)


class Timetable(db.Entity):
    id = PrimaryKey(int)
    route = Required(Route)
    stop = Required(Stop)
    next_stop = Required("Timetable", reverse="prev_stop")
    prev_stop = Optional("Timetable", reverse="next_stop")
    expected_duration = Required(timedelta)
    last_time = Optional("Time")


class Rider(User):
    checkin = Optional("Checkin")
    party_size = Required(int)


class Checkin(db.Entity):
    id = PrimaryKey(int, auto=True)
    rider = Required(Rider)
    stop = Required(Stop)
    start_time = Required(datetime, default=lambda: datetime.now())
    end_time = Optional(datetime)
    fulfilled = Required(bool, default=False)


class Time(db.Entity):
    id = PrimaryKey(datetime, default=lambda: datetime.now(), auto=True)
    duration = Optional(timedelta)
    average_duration = Optional(timedelta)
    timetable = Required(Timetable)


db.generate_mapping(create_tables=True)
