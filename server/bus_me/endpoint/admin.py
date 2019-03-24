from ..__types import JSONObject, JSONDict

from uuid import UUID

from pony.orm import db_session

from ..entities import Organization
from .login import LoginNamespace
from ._require_auth import require_auth


class AdminNamespace(LoginNamespace):
    @require_auth(permissions=["create_organization"])
    async def on_update_org(
        self: "AdminNamespace", sid: str, data: JSONObject, session_data: JSONDict
    ):
        """
        Create or update an organization.

        schema: dict:
            id: uuid?:
                If present and exists in the database, it will be assumed that
                that id should be updated. Otherwise, a new organization is
                created.
            values: dict: Values to update organization with.
        
        returns: UUID of organization updated (may be different from sent ID).
        """
        @db_session
        def db_sync():
            nonlocal data
            org = Organization.get(id=UUID(data["id"])) if "id" in data else None
            if not org:
                org = Organization()

            value = data["values"]
            if "id" in value:
                del value["id"]
            org.set(**value)

            return org

        return str(db_sync().id)
