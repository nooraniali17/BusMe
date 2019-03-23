from datetime import datetime, timedelta
from itertools import count

from aiohttp import ClientSession
from config2.config import config

from .jwt import decode_jwt, JWTVerifyError

__all__ = ["authenticate", "JWTVerifyError"]


_management_key: str = None
_management_expires: datetime = None
_auth_config = config.authentication


async def _get_manage_key(token_url: str, session: ClientSession):
    """
    Get Auth0 Management API access key.

    params:
        oauth_url: Oauth token url (should be under `/oauth/token`).
        session: Session to use for external requests.
    """
    global _management_key, _management_expires
    if not _management_key or _management_expires < datetime.now():
        async with session.post(token_url, json=_auth_config.management_params) as res:
            auth = await res.json()
        _management_key = auth["access_token"]
        _management_expires = datetime.now() + timedelta(seconds=auth["expires_in"])
    return _management_key


async def authenticate(auth_token: str):
    """
    Authenticate a token, and do housekeeping if necessary.

    params:
        auth_token: OpenID Connect ID Token (JWT).
        
    returns:
        id: Decoded ID Token details.
        permissions:
            A simplified list of permissions for this app, e.g.
            ['read:foo', 'update:foo', 'read:bar']. Only those permissions for
            this current app is kept.
            
            This will be compared against mappings in the config, so be sure to
            keep those updated.
    """

    def api_url(endpoint: str):
        return f"{_auth_config.management_api}{endpoint}"

    async with ClientSession() as session:
        manage_key_co = _get_manage_key(api_url("/oauth/token"), session)

        id_token = await decode_jwt(
            auth_token,
            _auth_config.openid_discovery,
            _auth_config.id_token_params,
            session,
        )

        permissions = []
        manage_key = await manage_key_co
        # for our purposes, it shouldn't exceed more than 50 permissions too
        # much
        for page in count():
            async with session.get(
                api_url(f'/api/v2/users/{id_token["sub"]}/permissions'),
                params={"include_totals": "true", "page": page},
                headers={"Authorization": f"Bearer {manage_key}"},
            ) as res:
                res_obj = await res.json()
                permissions.extend(res_obj["permissions"])
                if res_obj["total"] <= len(permissions):
                    break

        return {
            "id": id_token,
            "permissions": [
                p["permission_name"]
                for p in permissions
                if p["resource_server_identifier"] in _auth_config.api_id
            ],
        }
