from config2.config import config

from datetime import datetime

import peewee
import peewee_async
from peewee import (
    BooleanField,
    Check,
    DateTimeField,
    DeferredForeignKey,
    FloatField,
    ForeignKeyField,
    IntegerField,
    TextField,
    UUIDField,
)
from peewee_asyncext import PostgresqlExtDatabase
from playhouse.postgres_ext import IntervalField


__all__ = [
    "db",
    "Location",
    "Organization",
    "Route",
    "Stop",
    "Timetable",
    "User",
    "UserLocation",
]

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
    location = DeferredForeignKey("UserLocation", null=True)


class Location(Model):
    long = FloatField(constraints=(Check("long >= 0"), Check("long <= 180")))
    lat = FloatField(constraints=(Check("lat >= -90"), Check("lat <= 90")))


class UserLocation(Location):
    user = ForeignKeyField(User)
    time = DateTimeField(default=datetime.utcnow)


class Organization(Model):
    uuid = UUIDField(unique=True)
    name = TextField(null=True)
    primary_email = TextField(null=True)
    support_email = TextField(null=True)


# class Driver(User):  # type: ignore
#     routes = Set("Route", reverse="drivers")
#     last_route = Optional("Route", reverse="last_driver")


class Route(Model):
    name = TextField()
    active = BooleanField(default=True)
    timetable = DeferredForeignKey("Timetable", null=True)


# class Route(db.Entity):  # type: ignore
#     organization = Required(Organization)
#     drivers = Set(Driver, reverse="routes")
#     last_driver = Optional(Driver, reverse="last_route")
#     device_pair = Optional(UUID)


class Stop(Model):
    location = ForeignKeyField(Location, unique=True)


# class Stop(db.Entity):  # type: ignore
#     route_stops = Set("Timetable")
#     checkins = Set("Checkin")


class Timetable(Model):
    route = ForeignKeyField(Route)
    stop = ForeignKeyField(Stop)
    next_stop = ForeignKeyField("self", null=True)
    expected_duration = IntervalField()


# class Timetable(db.Entity):  # type: ignore
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

_db.create_tables(
    (Location, Organization, Route, Stop, Timetable, User, UserLocation), safe=True
)
_db.set_allow_sync(False)
db = peewee_async.Manager(_db)
