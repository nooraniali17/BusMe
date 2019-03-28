"""
Custom authentication flow for the BusMe app.

- Validates ID Token (OpenID Connect).
- Grabs user permissions from Auth0 (lazy).
"""
from typing import Any, Dict, List
from ..__types import JSONDict
from aiohttp import ClientSession

from datetime import datetime, timedelta
from itertools import count
from warnings import warn

from attributedict.collections import AttributeDict
from aiocache import cached
from config2.config import config

from .jwt import decode_jwt, JWTVerifyError

__all__ = ["authenticate", "JWTVerifyError"]


class AuthenticationData:
    """
    Authentication functionalities and storage.
    
    There are very few reasons to create this object on your own. Instead,
    always refer to the object returned by the `authenticate` call.
    """

    def __init__(
        self: "AuthenticationData",
        id_token: JSONDict,
        management_api: str,
        management_params: JSONDict,
        api_id: str,
        session: ClientSession,
    ):
        self.id_token = AttributeDict(id_token)
        self._management_api = management_api
        self._management_params = management_params
        self._api_id = api_id
        self._session = session

        self.user_id = self.id_token.sub
        if not self.user_id:
            warn(f'JWT does not have "sub" field: {id_token}')

    def _api_url(self, endpoint: str) -> str:
        return f"{self._management_api}{endpoint}"

    async def _get_management_key(
        self: "AuthenticationData", token_url: str, session: ClientSession
    ) -> JSONDict:
        """
        Get Auth0 Management API access data.

        params:
            token_url: Oauth token url (should be under `/oauth/token`).
            session: Session to use for external requests.
        """

        @cached()
        async def _get_management_access() -> JSONDict:
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

    async def _fetch_permissions(
        self: "AuthenticationData", session: ClientSession
    ) -> List[JSONDict]:
        """
        Get permissions from standard Management API url. Will stop early if any
        errors occur.
        """
        permissions: List[JSONDict] = []
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
                    print("This app has made too many requests.")
                    print("Now would be a great time to implement throttling.")

                if res.status >= 400:
                    print(f"{res.url}: HTTP", res.status)
                    print("----- headers -----")
                    print(res.headers)
                    print("----- content -----")
                    print(await res.content.read())
                    print("-------------------")
                    return permissions
                res_obj = await res.json()

            permissions.extend(res_obj["permissions"])
            if res_obj["total"] <= len(permissions):
                return permissions
        return []

    @cached()
    async def _permissions(
        self: "AuthenticationData", session: ClientSession
    ) -> List[str]:
        """Grabs simplified permissions list."""
        return [
            p["permission_name"]  # type: ignore
            for p in await self._fetch_permissions(session)
            if p["resource_server_identifier"] in self._api_id
        ]

    async def permissions(self: "AuthenticationData", reset: bool = False) -> List[str]:
        """
        Fetch a simplified list of permissions for this user, e.g.
        ['read:foo', 'update:foo', 'read:bar']. Only those permissions for
        the current app (specified by `api_id`) is kept. This will be compared
        against mappings in the config, so be sure to keep those updated.

        The result is cached forever.

        params:
            reset: Should the permissions object be reset?
        """
        return await self._permissions(  # pylint: disable=unexpected-keyword-arg
            self._session, cache_read=reset
        )

    def use_session(self: "AuthenticationData", session: ClientSession) -> None:
        """Change which session this permission should use."""
        self._session = session


_auth_config = config.authentication


async def authenticate(
    auth_token: str,
    session: ClientSession,
    openid_discovery: str = _auth_config.openid_discovery,
    id_token_params: JSONDict = _auth_config.id_token_params,
    management_api: str = _auth_config.management_api,
    management_params: JSONDict = _auth_config.management_params,
    api_id: str = _auth_config.api_id,
) -> AuthenticationData:
    """
    Authenticate a token, and do housekeeping if necessary.

    params:
        auth_token: OpenID Connect ID Token (JWT).
        session: Context HTTPS session to use.
        openid_discovery: OpenID discovery document URI.
        id_token_params: All parameters of JWT decoding function. (see PyJWT docs)
        management_api: Auth0 Management API endpoint.
        management_params:
            Auth0 Management API OpenID Connect token retrieval URL parameters.
        api_id: Auth0 Management API Audience Identification string.

    returns: Permissions object.
    """
    return AuthenticationData(
        await decode_jwt(auth_token, openid_discovery, id_token_params, session),
        management_api,
        management_params,
        api_id,
        session,
    )
