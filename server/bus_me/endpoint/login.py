from typing import Optional
from ..__types import JSONObject

from ._async_namespace import _AsyncNamespace
from ..authentication import authenticate, JWTVerifyError

__all__ = ["LoginNamespace"]


class LoginNamespace(_AsyncNamespace):
    """Namespace for handling logins."""

    async def on_login(self: "LoginNamespace", sid: str, data: JSONObject) -> None:
        try:
            if not isinstance(data, str):
                print(f"login expected token of {str}, got", type(data), "instead")
                return

            async with self.session(sid) as session:
                session["auth"] = await authenticate(data, self.app["session"])
            await self.emit("authenticated", room=sid)
        except JWTVerifyError as e:
            print(f"error authorizing session {sid}:", e)
            if e.expose_error:
                await self.emit(
                    "error", {"message": str(e), "event": "login"}, room=sid
                )
