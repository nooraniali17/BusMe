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
from inspect import cleandoc

_log = logging.getLogger(__name__)

__all__ = ["authenticate", "JWTVerifyError"]


class AuthenticationData:
    """
    Authentication functionalities and storage.
    
    There are very few reasons to create this object on your own. Instead,
    always refer to the object returned by the `authenticate` call.
    """

    def __init__(self, id_token, management_api, management_params, api_id, session):
        self.id_token = AttributeDict(id_token)
        self._management_api = management_api
        self._management_params = management_params
        self._api_id = api_id
        self._session = session

        self.user_id = self.id_token.sub
        if not self.user_id:
            warn(f'JWT does not have "sub" field: {id_token}')

    def _api_url(self, endpoint):
        """type: method AuthenticationData (str) -> str"""
        return f"{self._management_api}{endpoint}"

    async def _get_management_key(self, token_url, session):
        """
        Get Auth0 Management API access data.

        params:
            token_url: str:
                Oauth token url (should be under `/oauth/token`).
            session: ClientSession:
                Session to use for external requests.
        
        returns: JSONDict
        """

        @cached()
        async def _get_management_access():
            """type: () -> JSONDict"""
            nonlocal self, token_url
            async with session.post(token_url, json=self._management_params) as res:
                auth = await res.json()
            auth["expires_in"] = datetime.now() + timedelta(seconds=auth["expires_in"])
            return auth

        auth = await _get_management_access()
        if datetime.now() >= auth["expires_in"]:
            auth = await _get_management_access(  # pylint: disable=unexpected-keyword-arg
                cache_read=False
            )
        return auth["access_token"]

    async def _fetch_permissions(self, session):
        """
        Get permissions from standard Management API url. Will stop early if any
        errors occur.

        type: method AuthenticationData (ClientSession) -> JSONDict[]
        """
        permissions = []
        manage_key = await self._get_management_key(
            self._api_url("/oauth/token"), session
        )

        # for our purposes, it shouldn't exceed more than 50 permissions
        # but who knows?
        for page in count():
            async with session.get(
                self._api_url(f"/api/v2/users/{self.id_token.sub}/permissions"),
                params={"include_totals": "true", "page": page},
                headers={"Authorization": f"Bearer {manage_key}"},
            ) as res:
                if res.status == 429:
                    # TODO: actually implementing throttling
                    _log.error("This app has made too many requests.")

                if res.status >= 400:
                    _log.error(
                        cleandoc(
                            f"""{res.url}: HTTP {res.status}
                            ----- headers -----
                            {res.headers}
                            ----- content -----
                            {await res.content.read()}
                            -------------------"""
                        )
                    )
                    return permissions
                res_obj = await res.json()

            permissions.extend(res_obj["permissions"])
            if res_obj["total"] <= len(permissions):
                return permissions
        return []

    @cached()
    async def _permissions(self: "AuthenticationData", session):
        """
        Grabs simplified permissions list.
        
        type: method AuthenticationData (ClientSession) -> str[]
        """
        return [
            p["permission_name"]
            for p in await self._fetch_permissions(session)
            if p["resource_server_identifier"] in self._api_id
        ]

    async def permissions(self, reset=False):
        """
        Fetch a simplified list of permissions for this user, e.g.
        ['read:foo', 'update:foo', 'read:bar']. Only those permissions for
        the current app (specified by `api_id`) is kept. This will be compared
        against mappings in the config, so be sure to keep those updated.

        The result is cached forever.

        params:
            reset: bool: Should the permissions object be reset?
        
        returns: str[]
        """
        return await self._permissions(  # pylint: disable=unexpected-keyword-arg
            self._session, cache_read=reset
        )

    def use_session(self, session):
        """
        Change which session this permission should use.
        
        type: method AuthenticationData (ClientSession) -> None
        """
        self._session = session


_auth_config = config.authentication


async def authenticate(
    auth_token,
    session,
    openid_discovery=_auth_config.openid_discovery,
    id_token_params=_auth_config.id_token_params,
    management_api=_auth_config.management_api,
    management_params=_auth_config.management_params,
    api_id=_auth_config.api_id,
):
    """
    Authenticate a token, and do housekeeping if necessary.

    params:
        auth_token: str: OpenID Connect ID Token (JWT).
        session: ClientSession: Context HTTPS session to use.
        openid_discovery?: str: OpenID discovery document URI.
        id_token_params?: JSONDict:
            All parameters of JWT decoding function. (see PyJWT docs)
        management_api?: str: Auth0 Management API endpoint.
        management_params?: JSONDict:
            Auth0 Management API OpenID Connect token retrieval URL parameters.
        api_id?: str: Auth0 Management API Audience Identification string.

    returns: AuthenticationData: Permissions object.
    """
    return AuthenticationData(
        await decode_jwt(auth_token, openid_discovery, id_token_params, session),
        management_api,
        management_params,
        api_id,
        session,
    )
