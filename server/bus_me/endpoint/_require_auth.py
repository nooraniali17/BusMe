from typing import Any, Awaitable, Callable, Coroutine, List, Optional, Union

from functools import wraps

from socketio import AsyncNamespace
from config2.config import config

__all__ = ["require_auth"]


def _map_permissions(permissions: List[str], strict: bool) -> List[str]:
    def strict_map(p: str) -> str:
        return config.permissions[p]

    def loose_map(p: str) -> str:
        return config.permissions.get(p, p)

    return list(map(strict_map if strict else loose_map, permissions))


_TYPE_require_auth_receive = Callable[[AsyncNamespace, str, Any, Any], Optional[bool]]
_TYPE_require_auth_return = Callable[[AsyncNamespace, str, Any], Optional[bool]]
_TYPE_require_auth_reject = Callable[[AsyncNamespace, str, List[str]], Awaitable[None]]


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
    be used with the AsyncNamespace class.

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
        @wraps(fn)
        async def decorated(
            self: AsyncNamespace, sid: str, data: Any
        ) -> Optional[bool]:
            session_data = await self.get_session(sid)
            session_perms = session_data.get("permissions") or []

            # no login event has taken place or malformed data
            if not session_data or any(p not in session_perms for p in permissions):
                if reject:
                    await reject(
                        self, sid, [p for p in permissions if p not in session_perms]
                    )

                if error_event:
                    self.emit(error_event, "insufficient permissions")
                return False
            return await fn(self, sid, data, session_data)

        return decorated

    return decorator(skip_fn) if skip_fn else decorator
