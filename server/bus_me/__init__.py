from aiohttp import web
from socketio import AsyncServer

__all__ = ["main"]
socket = AsyncServer()
app = web.Application()
socket.attach(app)


@socket.on("connect")
def connect(sid, environ):
    print("connect", sid)


@socket.on("my event")
async def test_message(sid, data):
    print("message", data)
    await socket.emit("my response",  {"data": "got it!"})


@socket.on("disconnect")
def disconnect(sid):
    print("disconnect", sid)


def main():
    web.run_app(app)
