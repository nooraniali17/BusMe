"""
Custom authentication flow for the BusMe app.

- Validates ID Token (OpenID Connect).
- Grabs user permissions from Auth0 (lazy).
"""
from datetime import datetime, timedelta
from itertools import count
from warnings import warn

from attributedict.collections import AttributeDict
from aiocache import cached
from config2.config import config

from .jwt import decode_jwt, JWTVerifyError

import logging

_log = logging.getLogger(__name__)

__all__ = ["authenticate", "JWTVerifyError"]


class AuthenticationData:
    """
    Authentication functionalities and storage.
    
    There are very few reasons to create this object on your own. Instead,
    always refer to the object returned by the `authenticate` call.
    """

    def __init__(self, id_token, access_token):
        self.id_token = AttributeDict(id_token)
        self.access_token = AttributeDict(access_token)

        self.user_id = self.id_token.sub
        if not self.user_id:
            warn(f'ID token does not have "sub" field: {id_token}')

        self.permissions = self.access_token.permissions or {}
        if not self.permissions:
            warn(f"Access token is not JWT or lacks permissions field: {access_token}")


_auth_config = config.authentication


async def authenticate(
    id_token,
    access_token,
    session,
    openid_discovery=_auth_config.openid_discovery,
    id_token_params=_auth_config.id_token_params,
    access_token_params=_auth_config.access_token_params,
):
    """
    Authenticate a token, and do housekeeping if necessary.

    params:
        id_token: str: OpenID Connect ID Token (JWT).
        access_token: str:
            Auth0 Access Token (JWT). If missing, will simply fail on accessing
            permissions.
        session: ClientSession: Context HTTPS session to use.
        openid_discovery?: str: OpenID discovery document URI.
        id_token_params?: JSONDict:
            ID Token authentication parameters. (see PyJWT docs)
        access_token_params?: JSONDict:
            Access Token authentication parameters. (see PyJWT docs)

    returns: AuthenticationData: Permissions object.
    """
    id_data = await decode_jwt(id_token, openid_discovery, id_token_params, session)
    try:
        access_data = await decode_jwt(
            access_token, openid_discovery, access_token_params, session
        )
    except JWTVerifyError:
        access_data = None

    return AuthenticationData(id_data, access_data)
