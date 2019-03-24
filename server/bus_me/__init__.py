import logging

from typing import Any, AsyncIterator

from aiohttp import ClientSession
from aiohttp.web import Application, run_app
from pony.orm import db_session, select
from socketio import AsyncServer

from .entities import User
from .endpoint import BusMeApplication

__all__ = ["main"]


def logger_cfg():
    for module, level in config.loggers.items():
        logging.getLogger(module).setLevel(level)


def attach_session(app: Application) -> None:
    """
    The aiohttp docs say it's better to share client sessions for better
    parallel requests, so here we are.
    """

    async def cleanup_ctx(app: Application) -> AsyncIterator[None]:
        app["session"] = session = ClientSession()
        yield
        await session.close()

    app.cleanup_ctx.append(cleanup_ctx)


def attach_socketio(app: Application) -> None:
    socket = AsyncServer()
    socket.register_namespace(BusMeApplication(app=app))
    socket.attach(app)


def main() -> None:
    logger_cfg()

    app = Application()
    attach_socketio(app)
    attach_session(app)
    run_app(app)
