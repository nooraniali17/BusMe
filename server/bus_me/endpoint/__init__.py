"""
Socket.io application abstractions, to avoid depending on a global variable.
"""
from .admin import AdminNamespace
from .data import DataNamespace
from .rider import RiderNamespace

__all__ = ["BusMeApplication"]


class BusMeApplication(AdminNamespace, DataNamespace, RiderNamespace):
    """
    Aggregate namespace for the application. The other namespaces will not
    work properly if they are separated into namespaces, so this is in
    essence just a way to avoid depending on a global `socket` object.
    """

    pass