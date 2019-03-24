from ..__types import JSONObject, JSONDict

from uuid import uuid4

from ..entities import db, Organization
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

        org = None
        if "id" in data:
            try:
                org = await db.get(Organization, uuid=data["id"])
            except Organization.DoesNotExist:
                pass

        if not org:
            org = await db.create(Organization, uuid=uuid4())

        # update
        fields = Organization._meta.sorted_field_names
        for k, v in data["values"].items():
            if k not in ("id", "uuid") and k in fields:
                setattr(org, k, v)
        await db.update(org)

        return str(org.uuid)
