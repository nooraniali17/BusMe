from flask import Flask
from flask_socketio import SocketIO, emit

__all__ = ["main"]

app = Flask(__name__)
socketio = SocketIO(app)


@socketio.on("my event")
def test_message(message):
    emit("my response", {"data": "got it!"})


def main():
    socketio.run(app)
