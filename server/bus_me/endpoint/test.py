from ._async_namespace import _AsyncNamespace
from ._require_auth import require_auth


class TestNamespace(_AsyncNamespace):
    """Example namespace. Remove later when we actually implement stuff."""

    @require_auth(permissions=["create_route"])
    async def on_foo(self, sid, data, session_data):
        print("aaaa")
