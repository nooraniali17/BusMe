from uuid import uuid4

from ..entities import db, Organization
from ._require_auth import require_auth
from .login import LoginNamespace


class AdminNamespace(LoginNamespace):
    @require_auth(permissions=["create_organization"])
    async def on_update_org(self, sid, data, _):
        """
        Create or update an organization.

        schema: dict:
            id: uuid?:
                If present and exists in the database, it will be assumed that
                that id should be updated. Otherwise, a new organization is
                created.
            values: dict: Values to update organization with.
        
        returns: str:
            UUID of organization updated (may be different from sent ID).
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
        org.merge(("id", "uuid"), **data["values"])
        await db.update(org)

        return str(org.uuid)
