from functools import wraps

from config2.config import config

import logging

_log = logging.getLogger(__name__)

__all__ = ["require_auth"]


def _map_permissions(permissions, strict):
    """type: (str[], bool) -> str[]"""

    def strict_map(p):
        """type: (str) -> str"""
        return config.permissions[p]

    def loose_map(p):
        """type: (str) -> str"""
        return config.permissions.get(p, p)

    return list(map(strict_map if strict else loose_map, permissions))


def require_auth(
    permissions=[], strict_mappings=True, reject=None, error_event="error"
):
    """
    Decorator to check that the session has the correct permissions. Should only
    be used with the internal `_AsyncNamespace` and `aiohttp.web.Application`.

    params:
        permissions: str[]:
            Permissions to look for. If permissions is empty or missing, this
            will assume that all users are allowed and simply ensure that an ID
            Token is available.

            Will use permission mappings from config module.
        strict_mappings: bool:
            If mapping is not available, should it fail, or use the mapping
            verbatim as the permission?
        reject?: async (_AsyncNamespace<Application>, str, str[]) -> void:
            Action to take upon rejecting based on permissions. Arguments should
            take an session ID and missing permissions.
        error_event: str:
            Which endpoint to notify for errors. Mark `None` to suppress emits.
    
    returns:
        (async (
            _AsyncNamespace<Application>, str, AuthenticationData, ...JSONObject
        ) -> JSONObject)
            -> async (_AsyncNamespace<Application>, str, ...JSONObject) -> JSONObject
    """
    permissions = _map_permissions(permissions, strict_mappings)

    def decorator(fn):
        # guess event name, and since we are assuming this is tightly coupled
        # with the _AsyncNamespace class we can also assume that `on_(.+) => $1`
        event_name = fn.__name__[3:] if fn.__name__.startswith("on_") else fn.__name__

        @wraps(fn)
        async def decorated(self, sid, *data):
            nonlocal error_event, permissions, reject
            session_data = (await self.get_session(sid)).get("auth")

            async def get_session_perms():
                """type: () -> str[]"""
                nonlocal self, session_data
                return await session_data.permissions(self.app["session"])

            async def reject_cb():
                """type: () -> void"""
                nonlocal self, error_event, permissions, reject, sid
                _log.info(f'event "{event_name}" rejected for session {sid}')
                if reject:
                    session_perms = await get_session_perms()
                    await reject(
                        self, sid, [p for p in permissions if p not in session_perms]
                    )
                if error_event:
                    await self.emit(
                        error_event,
                        {"message": "Insufficient permissions.", "event": event_name},
                        room=sid,
                    )

            async def check_permissions():
                """type: () -> bool"""
                nonlocal permissions, session_data
                # no auth data means no chance of matching
                if not session_data:
                    return False

                # no target permissions means no need to check permissions
                if not permissions:
                    return True

                # finally, check that all required permissions are granted
                session_perms = await get_session_perms()
                return session_data and all(p in session_perms for p in permissions)

            if await check_permissions():
                return await fn(self, sid, session_data, *data)
            await reject_cb()

        return decorated

    return decorator
