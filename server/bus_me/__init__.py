from typing import Any

from aiohttp import web
from pony.orm import db_session, select
from socketio import AsyncServer

from .entities import User
from .endpoint import Application

__all__ = ["main"]
socket = AsyncServer()
app = web.Application()
socket.attach(app)
socket.register_namespace(Application())


def main():
    web.run_app(app)
