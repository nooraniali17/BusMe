from typing import Any

from aiohttp import web, ClientSession
from pony.orm import db_session, select
from socketio import AsyncServer

from .entities import User
from .endpoint import Application

__all__ = ["main"]


def attach_session(app):
    async def cleanup_ctx(app):
        app["session"] = session = ClientSession()
        yield
        await session.close()

    app.cleanup_ctx.append(cleanup_ctx)


def attach_socketio(app):
    socket = AsyncServer()
    socket.register_namespace(Application(app=app))
    socket.attach(app)


def main():
    app = web.Application()
    attach_socketio(app)
    attach_session(app)
    web.run_app(app)
