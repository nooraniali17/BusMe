from ._async_namespace import _AsyncNamespace
from ..authentication import authenticate, JWTVerifyError

import logging
from inspect import cleandoc

_log = logging.getLogger(__name__)

__all__ = ["LoginNamespace"]


class LoginNamespace(_AsyncNamespace):
    """Namespace for handling logins."""

    async def on_login(self, sid, id_token, access_token=""):
        """
        type: method LoginNamespace (str, str, str?) -> void
        
        schema:
            id_token: str: OpenID Connect ID Token (JWT).
            access_token?: str:
                Auth0 Access Token (JWT). Leave empty if no elevated permissions
                are ever needed.
        """
        try:
            if not isinstance(id_token, str):
                return _log.error(
                    f"""login expected id token of: {str}, got: {id_token}"""
                )

            async with self.session(sid) as session:
                session["auth"] = await authenticate(
                    id_token, access_token, self.app["session"]
                )
                _log.info(f"logged in session {sid} as user {session['auth'].user_id}")
                _log.debug(f"-- with permissions {session['auth'].permissions}")
            await self.emit("authenticated", room=sid)
        except JWTVerifyError as e:
            _log.error(f"error authorizing session {sid}: {e}")
            await self.emit(
                "error",
                {
                    "message": str(e) if e.expose_error else "Failed login",
                    "event": "login",
                },
                room=sid,
            )
