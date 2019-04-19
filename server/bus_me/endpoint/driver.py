from asyncio import sleep
from datetime import timedelta

from peewee import IntegrityError
from psycopg2.errors import CheckViolation

from ..entities import db, Checkin, Location, Rider, Stop, Timetable, UserLocation, User
from ._require_auth import require_auth
from .login import LoginNamespace

import logging

_log = logging.getLogger(__name__)

__all__ = ["DriverNamespace"]

class DriverNamespace(LoginNamespace):
    @require_auth()
    