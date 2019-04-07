from ..__types import JSONObject, JSONDict

from datetime import datetime, timedelta

from peewee import IntegrityError

from ..entities import db, Location, User
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
            await db.create(Location, user=user, long=long, lat=lat)
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
