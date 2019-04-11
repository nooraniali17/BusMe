import logging

import ssl

from aiohttp import ClientSession
from aiohttp.web import Application, run_app
from config2.config import config
from socketio import AsyncServer

from .endpoint import BusMeApplication

__all__ = ["main"]


def logger_cfg():
    """type: (void) -> void"""
    for module, level in config.loggers.items():
        logging.getLogger(module).setLevel(level)


def attach_session(app):
    """
    The aiohttp docs say it's better to share client sessions for better
    parallel requests, so here we are.

    type: (Application) -> void
    """

    async def cleanup_ctx(app):
        """type: async (Application) -> iter<void>"""
        app["session"] = session = ClientSession()
        yield
        await session.close()

    app.cleanup_ctx.append(cleanup_ctx)


def attach_socketio(app):
    """type: (Application) -> void"""
    socket = AsyncServer()
    socket.register_namespace(BusMeApplication(app=app))
    socket.attach(app)


def attach_static(app):
    """type: (Application) -> void"""
    for path in config.static_files or []:
        app.router.add_static("/", path)


def get_ssl_context():
    """type: () -> SSLContext"""
    ctx = None
    if config.ssl:
        ctx = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
        ctx.load_cert_chain(config.ssl.cert, config.ssl.key)
    return ctx


def main():
    """type: () -> void"""
    logger_cfg()

    app = Application()
    attach_socketio(app)
    attach_session(app)
    attach_static(app)

    run_app(app, ssl_context=get_ssl_context())
