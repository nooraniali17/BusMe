from asyncio import sleep
from datetime import timedelta

from peewee import IntegrityError

from ..entities import db, Location, Stop, UserLocation, User
from ._require_auth import require_auth
from .login import LoginNamespace

import logging

_log = logging.getLogger(__name__)

__all__ = ["RiderNamespace"]


class RiderNamespace(LoginNamespace):
    @require_auth()
    async def on_location(self, sid, auth, long, lat):
        """
        Update user location. Note that this will not attempt to preserver order, as
        the user will not usually move very far in the time interval in which
        out-of-order problems may occur.
        
        schema: [float, float]:
            Longitude, latitude. Should be provided by something like Google Maps.
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
        "stops".

        schema: [float, float]: (default: (0.01, 0.01))
            Degrees longitude and latitude from current location to search
            within.
        
        yields: int[]: List of nearby stops by ID.
        """

        async def update_stops():
            nonlocal self, sid, auth, long_dist, lat_dist
            # get location

            user = await db.get(User, oidc_id=auth.user_id)
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

            with db.allow_sync():
                stop_query = (
                    Stop.select()
                    .join(Location)
                    .where(
                        Location.long.between(long_min, long_max)
                        & Location.lat.between(lat_min, lat_max)
                    )
                )
                stops = [s.id for s in stop_query]

            await self.emit("stops", stops, room=sid)

        _log.info(f"User {auth.user_id} subscribed to stops.")
        await update_stops()
        while await sleep(10, result=True):
            if sid not in self.active_users:
                _log.info(f"User {auth.user_id} inactive, stopping stops updates.")
                return
            await update_stops()
