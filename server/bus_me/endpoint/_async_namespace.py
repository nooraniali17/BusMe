from socketio import AsyncNamespace

__all__ = ["_AsyncNamespace"]


class _AsyncNamespace(AsyncNamespace):
    """
    Extended `AsyncNamespace` that accepts a deployment object (eg
    `aiohttp.web.Application`) in order to allow interactions with non socket
    portions of the app.

    Currently only made with aiohttp in mind, but could technically be expanded
    to include e.g. Pyramid.

    Dumb hack courtesy of:
    https://github.com/miguelgrinberg/python-socketio/issues/142

    generic: cls<T>
    constructor: method AsyncNamespace (T, str?)
    """

    active_users = set()

    def __init__(self, app, namespace=None):
        super().__init__(namespace=namespace)
        self.app = app

    def on_connect(self, sid, environ):
        self.active_users.add(sid)

    async def on_disconnect(self, sid):
        self.active_users.remove(sid)
