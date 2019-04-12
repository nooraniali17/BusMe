from asyncio import sleep
from datetime import timedelta

from peewee import IntegrityError

from ..entities import db, Checkin, Location, Rider, Stop, Timetable, UserLocation, User
from ._require_auth import require_auth
from .login import LoginNamespace

import logging

_log = logging.getLogger(__name__)

__all__ = ["RiderNamespace"]


class RiderNamespace(LoginNamespace):
    @require_auth()
    async def on_location(self, sid, auth, long, lat):
        """
        Update user location. Note that this will not attempt to preserve order,
        as the user will not usually move very far in the time interval in which
        out-of-order problems may occur.
        
        schema: [float, float]:
            Longitude, latitude. Should be provided by something like Google
            Maps.
        """
        try:
            user, _ = await db.get_or_create(User, oidc_id=auth.user_id)
            user.location = await db.create(UserLocation, user=user, long=long, lat=lat)
            await db.update(user)
            _log.info(f"User {auth.user_id} updated location to {(long, lat)}")
        except IntegrityError:
            await self.emit(
                "error",
                {
                    "message": f"Invalid geographic coordinates {(long, lat)}",
                    "event": "location",
                },
                room=sid,
            )

    @require_auth()
    async def on_sub_stops(self, sid, auth, long_dist=0.01, lat_dist=0.01):
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
            nonlocal self, sid, auth, long_dist, lat_dist
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

            long_min = location.long - long_dist
            long_max = location.long + long_dist
            lat_min = location.lat - lat_dist
            lat_max = location.lat + lat_dist

            stop_query = await db.prefetch(
                Stop.select()
                .join(Location)
                .where(
                    Location.long.between(long_min, long_max)
                    & Location.lat.between(lat_min, lat_max)
                ),
                Location.select(),
            )

            await self.emit(
                "stops",
                {s.id: (s.location.long, s.location.lat) for s in stop_query},
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
        timetable = await db.get(Timetable, id=data["id"])
        user, _ = await db.get_or_create(Rider, oidc_id=auth.user_id)
        user.checkin = await db.create(
            Checkin, party_size=data["party"], route=timetable
        )
