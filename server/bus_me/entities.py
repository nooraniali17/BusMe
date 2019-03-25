from config2.config import config

import peewee
import peewee_async
from peewee import UUIDField, TextField

from .__sqlite_patch import SqliteExtDatabase

__all__ = ["Organization", "db"]

_db = SqliteExtDatabase(**config.database)


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


# class User(db.Entity):  # type: ignore
#     id = PrimaryKey(int, auto=True)
#     oidc_id = Required(str)


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

_db.create_tables([Organization], safe=True)
_db.set_allow_sync(False)
db = peewee_async.Manager(_db)
