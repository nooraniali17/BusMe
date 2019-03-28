from typing import Optional
from ..__types import JSONObject

from ._async_namespace import _AsyncNamespace
from ..authentication import authenticate, JWTVerifyError

import logging

_log = logging.getLogger(__name__)

__all__ = ["LoginNamespace"]


class LoginNamespace(_AsyncNamespace):
    """Namespace for handling logins."""

    async def on_login(self: "LoginNamespace", sid: str, data: JSONObject) -> None:
        try:
            if not isinstance(data, str):
                _log.error(f"login expected token of {str}, got {type(data)} instead")
                return

            async with self.session(sid) as session:
                session["auth"] = await authenticate(data, self.app["session"])
                _log.info(f"logged in session {sid} as user {session['auth'].user_id}")
            await self.emit("authenticated", room=sid)
        except JWTVerifyError as e:
            _log.error(f"error authorizing session {sid}: {e}")
            if e.expose_error:
                await self.emit(
                    "error", {"message": str(e), "event": "login"}, room=sid
                )
