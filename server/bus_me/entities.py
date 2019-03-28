from config2.config import config

from datetime import datetime

import peewee
import peewee_async
from peewee import (
    Check,
    DateTimeField,
    FloatField,
    ForeignKeyField,
    TextField,
    UUIDField,
)
from peewee_asyncext import PostgresqlExtDatabase

__all__ = ["Organization", "db"]

_db = PostgresqlExtDatabase(**config.database)


class Model(peewee.Model):
    def merge(self, excluded=None, **kwargs):
        """
        Utility method to merge multiple properties at once.

        params:
            excluded: A list of fields to ignore (eg identifier)
        """
        excluded = excluded or tuple()

        for k, v in kwargs.items():
            if k not in excluded and k in self._meta.sorted_field_names:
                setattr(self, k, v)

    class Meta:
        database = _db


class User(Model):
    oidc_id = TextField(unique=True)


class Location(Model):
    user = ForeignKeyField(User)
    long = FloatField(constraints=(Check("long >= 0"), Check("long <= 180")))
    lat = FloatField(constraints=(Check("lat >= -90"), Check("lat <= 90")))
    time = DateTimeField(default=datetime.utcnow)


class Organization(Model):
    uuid = UUIDField(unique=True)
    name = TextField(null=True)
    primary_email = TextField(null=True)
    support_email = TextField(null=True)


# class Driver(User):  # type: ignore
#     routes = Set("Route", reverse="drivers")
#     last_route = Optional("Route", reverse="last_driver")


# class Route(db.Entity):  # type: ignore
#     id = PrimaryKey(int, auto=True)
#     organization = Required(Organization)
#     drivers = Set(Driver, reverse="routes")
#     last_driver = Optional(Driver, reverse="last_route")
#     timetable = Set("Timetable")
#     name = Required(str)
#     device_pair = Optional(UUID)


# class Stop(db.Entity):  # type: ignore
#     id = PrimaryKey(int, auto=True)
#     route_stops = Set("Timetable")
#     checkins = Set("Checkin")
#     name = Required(str)
#     longitude = Required(float)
#     latitude = Required(float)
#     gmaps_query = Optional(Json)


# class Timetable(db.Entity):  # type: ignore
#     id = PrimaryKey(int)
#     route = Required(Route)
#     stop = Required(Stop)
#     next_stop = Required("Timetable", reverse="prev_stop")
#     prev_stop = Optional("Timetable", reverse="next_stop")
#     expected_duration = Required(timedelta)
#     last_time = Optional("Time")


# class Rider(User):  # type: ignore
#     checkin = Optional("Checkin")
#     party_size = Required(int)


# class Checkin(db.Entity):  # type: ignore
#     id = PrimaryKey(int, auto=True)
#     rider = Required(Rider)
#     stop = Required(Stop)
#     start_time = Required(datetime, default=lambda: datetime.now())
#     end_time = Optional(datetime)
#     fulfilled = Required(bool, default=False)


# class Time(db.Entity):  # type: ignore
#     id = PrimaryKey(datetime, default=lambda: datetime.now(), auto=True)
#     duration = Optional(timedelta)
#     average_duration = Optional(timedelta)
#     timetable = Required(Timetable)

_db.create_tables((Location, Organization, User), safe=True)
_db.set_allow_sync(False)
db = peewee_async.Manager(_db)
