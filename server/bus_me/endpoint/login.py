from socketio import AsyncNamespace

from ..authentication import authenticate, JWTVerifyError


class LoginNamespace(AsyncNamespace):
    """Namespace for handling logins."""

    async def on_login(self, sid, data):
        try:
            await self.save_session(sid, await authenticate(data))
            await self.emit("authenticated")
        except JWTVerifyError as e:
            print(f"error authorizing session {sid}:", e)
            return False
