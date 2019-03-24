from typing import Generic, TypeVar

from socketio import AsyncNamespace

__all__ = ["_AsyncNamespace"]

T = TypeVar("T")

class _AsyncNamespace(AsyncNamespace, Generic[T]):
    """
    Extended `AsyncNamespace` that accepts a deployment object (eg
    `aiohttp.web.Application`) in order to allow interactions with non socket
    portions of the app.

    Dumb hack courtesy of:
    https://github.com/miguelgrinberg/python-socketio/issues/142
    """

    def __init__(self: "AsyncNamespace", app: T, namespace: str=None):
        super().__init__(namespace=namespace)
        self.app = app

