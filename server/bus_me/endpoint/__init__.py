from .login import LoginNamespace
from .test import TestNamespace


class Application(LoginNamespace, TestNamespace):
    """
    Aggregate namespace for the application. The other namespaces will not
    work properly if they are separated into namespaces, so this is in
    essence just a way to avoid depending on a global `socket` object.
    """
    pass
