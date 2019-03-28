"""
JWT decoding convencience function.

- Grabs JWKS from OpenID discovery document.
"""
import json

import jwt
from aiocache import cached
from config2.config import config
from jwt.algorithms import RSAAlgorithm
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError

__all__ = ["decode_jwt"]


class JWTVerifyError(ValueError):
    """Could not verify JWT, so here we are."""

    def __init__(self, *args, expose_error=False, **kwargs):
        super().__init__(*args, **kwargs)
        self.expose_error = expose_error


async def _jwk_key(raw_token, jwk_url, session):
    """
    Attempt to grab a matching key from JWK endpoint.

    params:
        raw_token: str: JWT in encoded format, to check header against.
        jwk_url: str: Endpoint from which all public keys are stored.
        session: ClientSession: HTTPS session to use.
    
    returns: _RSAPublicKey
    """

    @cached(ttl=60 * 60)
    async def get_jwks(url):
        """
        Get JWK Set from URL. Results are cached for an hour.
        
        type: (str) -> JSONObject
        """
        async with session.get(url) as res:
            return await res.json()

    # get jwt header
    header = jwt.get_unverified_header(raw_token)

    # grab first matching
    try:
        return RSAAlgorithm.from_jwk(
            json.dumps(
                next(
                    j
                    for j in (await get_jwks(jwk_url))["keys"]
                    if j["kid"] == header["kid"]
                )
            )
        )
    except StopIteration:
        raise JWTVerifyError(
            "JWT is not authenticated with a key provided by the JWK endpoint."
        )


async def decode_jwt(auth_token, openid_discovery, jwt_kwargs, session):
    """
    Decode a JWT, given a raw token and secret key.

    params:
        auth_header: str: Token in encoded format.
        openid_discovery: str: OpenID Connect discovery document endpoint URI.
        jwt_kwargs: JSONDict: All parameters of JWT decoding function. (see PyJWT docs)
        session: ClientSession: Session to use for remote calls.
    
    returns: JSONDict
    """

    async def get_args():
        """
        Get key and issuer.
        
        type: () -> JSONDict
        """
        nonlocal auth_token, openid_discovery, session

        @cached(ttl=60 * 60)
        async def get_discovery(url):
            """
            Get OpenID Connect Discovery Document. Results are cached for an
            hour.

            type: (str) -> JSONObject
            """
            nonlocal session
            async with session.get(url) as res:
                return await res.json()

        discovery_doc = await get_discovery(openid_discovery)
        return {
            "key": await _jwk_key(auth_token, discovery_doc["jwks_uri"], session),
            "issuer": discovery_doc["issuer"],
        }

    try:
        return jwt.decode(auth_token, **await get_args(), **jwt_kwargs)  # type: ignore
    except ExpiredSignatureError as e:
        raise JWTVerifyError(f"JWT token expired.", expose_error=True)
    except InvalidTokenError as e:
        raise JWTVerifyError(f"JWT internal error: {e}")
