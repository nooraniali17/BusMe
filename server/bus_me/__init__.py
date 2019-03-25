import logging

from typing import Any, AsyncIterator

import ssl

from aiohttp import ClientSession
from aiohttp.web import Application, run_app
from config2.config import config
from socketio import AsyncServer

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


def get_ssl_context():
    ctx = None
    if config.ssl:
        ctx = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
        ctx.load_cert_chain(config.ssl.cert, config.ssl.key)
    return ctx


def main() -> None:
    logger_cfg()

    app = Application()
    attach_socketio(app)
    attach_session(app)

    run_app(app, ssl_context=get_ssl_context())
