from asyncio import sleep
from datetime import timedelta

from peewee import IntegrityError
from psycopg2.errors import CheckViolation

from ..entities import db, Checkin, Location, Rider, Stop, Timetable, UserLocation, User
from ._require_auth import require_auth
from .login import LoginNamespace

import logging

_log = logging.getLogger(__name__)

__all__ = ["RiderNamespace"]


class RiderNamespace(LoginNamespace):
    @require_auth()
    async def on_location(self, sid, auth, data):
        """
        Update user location. Note that this will not attempt to preserve order,
        as the user will not usually move very far in the time interval in which
        out-of-order problems may occur.
        
        schema: dict:
            Should be provided by something like Google Maps.
            lng: Longitude.
            lat: Latitude.
        """
        lng = data["lng"]
        lat = data["lat"]

        try:
            user, _ = await db.get_or_create(User, oidc_id=auth.user_id)
            user.location = await db.create(UserLocation, user=user, lng=lng, lat=lat)
            await db.update(user)
            _log.info(f"User {auth.user_id} updated location to {(lng, lat)}")
        except IntegrityError:
            await self.emit(
                "error",
                {
                    "message": f"Invalid geographic coordinates {(lng, lat)}",
                    "event": "location",
                },
                room=sid,
            )

    @require_auth()
    async def on_sub_stops(self, sid, auth, lng_dist=0.01, lat_dist=0.01):
        """
        Start subscription to stops, once every 10 seconds. Yields to event
        `"stops"`.

        schema: [float, float]: (default: (0.01, 0.01))
            Degrees longitude and latitude from current location to search
            within.
        
        yields: dict[]: per:
            [id]: [float, float]: Longitude, latitude of stop keyed by stop ID.
        """

        async def update_stops():
            nonlocal self, sid, auth, lng_dist, lat_dist
            # get location

            user, _ = await db.get_or_create(User, oidc_id=auth.user_id)
            if user:
                with db.allow_sync():
                    location = user.location
            else:
                location = None

            if location is None:
                _log.info(f"User {auth.user_id} does not have a location.")
                return

            lng_min = location.lng - lng_dist
            lng_max = location.lng + lng_dist
            lat_min = location.lat - lat_dist
            lat_max = location.lat + lat_dist

            stop_query = await db.prefetch(
                Stop.select()
                .join(Location)
                .where(
                    Location.lng.between(lng_min, lng_max)
                    & Location.lat.between(lat_min, lat_max)
                ),
                Location.select(),
            )

            await self.emit(
                "stops",
                {s.id: (s.location.lng, s.location.lat) for s in stop_query},
                room=sid,
            )

        _log.info(f"User {auth.user_id} subscribed to stops.")
        await update_stops()
        while await sleep(10, result=True):
            if sid not in self.active_users:
                _log.info(f"User {auth.user_id} inactive, stopping stops updates.")
                return
            await update_stops()

    @require_auth()
    async def on_check_in(self, sid, auth, data):
        """
        Check in to a stop.

        schema: dict:
            id: int: Timetable ID to check in to.
            party: int: Party size. (0 < i <= 10) 
        """
        try:
            # timetable = await db.get(Timetable, id=data["id"])
            user, _ = await db.get_or_create(User, oidc_id=auth.user_id)
            rider, _ = await db.get_or_create(Rider, user=user)
            rider.checkin = await db.create(
                Checkin,
                party_size=data["party"],
                # route=timetable
            )
        except (IntegrityError, CheckViolation):
            await self.emit(
                "error",
                {"message": f"Party size not within valid range", "event": "check_in"},
                room=sid,
            )
        _log.info(f"User {auth.user_id} checked in with party of {data['party']}")
