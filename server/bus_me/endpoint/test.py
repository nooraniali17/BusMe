from .login import LoginNamespace
from ._require_auth import require_auth

__all__ = ["TestNamespace"]


class TestNamespace(LoginNamespace):
    """Example namespace. Remove later when we actually implement stuff."""

    @require_auth(permissions=["create_route"])
    async def on_foo(self, sid, data, session_data):
        print("aaaa", data)
