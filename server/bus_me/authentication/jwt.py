from typing import Any, Dict, List
from ..__types import JSONObject, JSONDict
from cryptography.hazmat.backends.openssl.rsa import _RSAPublicKey
from aiohttp import ClientSession

import json

import jwt
from aiocache import cached
from config2.config import config
from jwt.algorithms import RSAAlgorithm
from jwt.exceptions import InvalidTokenError

__all__ = ["decode_jwt"]


class JWTVerifyError(ValueError):
    """Could not verify JWT, so here we are."""

    pass


async def _jwk_key(
    raw_token: str, jwk_url: str, session: ClientSession
) -> _RSAPublicKey:
    """
    Attempt to grab a matching key from JWK endpoint.

    params:
        raw_token: JWT in encoded format, to check header against.
        jwk_url: Endpoint from which all public keys are stored.
        session: HTTPS session to use.
    """

    @cached(ttl=60 * 60)
    async def get_jwks(url: str) -> JSONObject:
        """Get JWK Set from URL. Results are cached for an hour."""
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


async def decode_jwt(
    auth_token: str, openid_discovery: str, jwt_kwargs: JSONDict, session: ClientSession
) -> JSONDict:
    """
    Decode a JWT, given a raw token and secret key.

    params:
        auth_header: Token in encoded format.
        openid_discovery: OpenID Connect discovery document endpoint URI.
        jwt_kwargs: All parameters of JWT decoding function. (see PyJWT docs)
        session: Session to use for remote calls.
    """

    async def get_args() -> JSONDict:
        """Get key and issuer."""
        nonlocal auth_token, openid_discovery, session

        @cached(ttl=60 * 60)
        async def get_discovery(url: str) -> JSONObject:
            """
            Get OpenID Connect Discovery Document. Results are cached for an
            hour.
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
    except InvalidTokenError as e:
        raise JWTVerifyError(f"JWT internal error: {e}")
