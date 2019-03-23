from typing import Any, Awaitable, Callable, Coroutine, List, Optional, Union
from ._async_namespace import _AsyncNamespace

from functools import wraps

from config2.config import config

__all__ = ["require_auth"]


def _map_permissions(permissions: List[str], strict: bool) -> List[str]:
    def strict_map(p: str) -> str:
        return config.permissions[p]

    def loose_map(p: str) -> str:
        return config.permissions.get(p, p)

    return list(map(strict_map if strict else loose_map, permissions))


_TYPE_require_auth_receive = Callable[[_AsyncNamespace, str, Any, Any], Optional[bool]]
_TYPE_require_auth_return = Callable[[_AsyncNamespace, str, Any], Optional[bool]]
_TYPE_require_auth_reject = Callable[[_AsyncNamespace, str, List[str]], Awaitable[None]]


def require_auth(
    skip_fn: _TYPE_require_auth_receive = None,
    *,
    permissions: List[str] = [],
    strict_mappings: bool = True,
    reject: _TYPE_require_auth_reject = None,
    error_event: str = "error",
) -> Callable[[_TYPE_require_auth_receive], _TYPE_require_auth_return]:
    """
    Decorator to check that the session has the correct permissions. Should only
    be used with the internal _AsyncNamespace class.

    params:
        skip_fn:
            Used to distinguish between `@decorator` and `@decorator()` modes.
        permissions:
            Permissions to look for. If permissions is empty or missing, this
            will assume that all users are allowed and simply ensure that an ID
            Token is available.

            Will use permission mappings from config module.
        strict_mappings:
            If mapping is not available, should it fail, or use the mapping
            verbatim as the permission?
        reject:
            Action to take upon rejecting based on permissions. Arguments should
            take an session ID and missing permissions.
        error_event:
            Which endpoint to notify for errors. Mark `None` to suppress emits.
    """
    permissions = _map_permissions(permissions, strict_mappings)

    def decorator(fn: _TYPE_require_auth_receive) -> _TYPE_require_auth_return:
        # guess event name, and since we are assuming this is tightly coupled
        # with the _AsyncNamespace class we can also assume that `on_(.+) => $1`
        event_name = fn.__name__[3:] if fn.__name__.startswith("on_") else fn.__name__

        @wraps(fn)
        async def decorated(
            self: _AsyncNamespace, sid: str, data: Any
        ) -> Optional[bool]:
            nonlocal error_event, permissions, reject
            session_data = (await self.get_session(sid)).get("auth")

            async def get_session_perms() -> List[str]:
                nonlocal self, session_data
                return await session_data.permissions(self.app["session"])

            async def accept_cb() -> Optional[bool]:
                nonlocal fn, self, sid, data, session_data
                return await fn(self, sid, data, session_data)

            async def reject_cb() -> bool:
                nonlocal self, error_event, permissions, reject, sid
                if reject:
                    session_perms = await get_session_perms()
                    await reject(
                        self, sid, [p for p in permissions if p not in session_perms]
                    )
                if error_event:
                    await self.emit(
                        error_event,
                        {"message": "insufficient permissions", "event": event_name},
                    )
                return False

            async def check_permissions() -> bool:
                nonlocal permissions, session_data
                # no auth data means no chance of matching
                if not session_data:
                    return False

                # no target permissions means no need to check permissions
                if not permissions:
                    return True

                # finally, check that all required permissions are granted
                session_perms = await get_session_perms()
                return bool(
                    session_data and all(p in session_perms for p in permissions)
                )

            return await (accept_cb if await check_permissions() else reject_cb)()

        return decorated

    return decorator(skip_fn) if skip_fn else decorator
