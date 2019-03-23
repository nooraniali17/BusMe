from ._async_namespace import _AsyncNamespace
from ..authentication import authenticate, JWTVerifyError

__all__ = ["LoginNamespace"]


class LoginNamespace(_AsyncNamespace):
    """Namespace for handling logins."""

    async def on_login(self, sid, data):
        try:
            await self.save_session(
                sid, {"auth": await authenticate(data, self.app["session"])}
            )
            await self.emit("authenticated")
        except JWTVerifyError as e:
            print(f"error authorizing session {sid}:", e)
            return False
