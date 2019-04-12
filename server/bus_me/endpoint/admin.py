from datetime import timedelta
from uuid import uuid4

from ..entities import db, Location, Organization, Route, Stop, Timetable, User
from ._require_auth import require_auth
from .login import LoginNamespace


class AdminNamespace(LoginNamespace):
    @require_auth(permissions=["create_organization"])
    async def on_update_org(self, sid, _, data):
        """
        Create or update an organization.

        schema: dict:
            id: uuid?:
                If present and exists in the database, it will be assumed that
                that id should be updated. Otherwise, a new organization is
                created.
            values: dict:
                Values to update organization with. (see `Organization`).
        
        returns: str:
            UUID of organization updated (may be different from sent ID).
        """

        org = None
        if "id" in data:
            org = await db.get(Organization, uuid=data["id"])
        if not org:
            org = await db.create(Organization, uuid=uuid4())

        # update
        org.merge(("id", "uuid"), **data["values"])
        await db.update(org)

        return str(org.uuid)

    @require_auth(permissions=["create_route"])
    async def on_create_route(self, sid, _, data):
        """
        Create or update a route.

        schema: dict:
            id: int?:
                Route ID to update or create (will only allow update of own
                organization). TODO: implement organization restrictions.
            name: str?: Name of the route.
            stops: dict[]: per:
                at: [float, float]: Geolocation, longitude and latitude.
                time: float:
                    Expected time from last stop (in seconds). First stop will
                    be measured from last stop.

        returns: int: ID of newly created route.
        """
        route = None
        if "id" in data:
            route = await db.get(Route, id=data["id"])
            route.name = data.get("name", route.name)
        if not route:
            route = await db.create(Route, name=data.get("name", uuid4()))

        stop_data = data["stops"]

        # prepare stops and locations
        locations = [
            (await db.get_or_create(Location, lng=lng, lat=lat))[0]
            for lng, lat in (s["at"] for s in stop_data)
        ]
        stops = (
            (stop, (await db.get_or_create(Stop, location=location))[0])
            for location, stop in zip(locations, stop_data)
        )

        # get timetables from database
        timetables = []
        async for data, stop in stops:
            timetable = await db.create(
                Timetable,
                route=route,
                stop=stop,
                expected_duration=timedelta(seconds=data["time"]),
            )
            timetables.append(timetable)

        # link timetables
        for i, timetable in enumerate(timetables):
            try:
                timetable.next_stop = timetables[i + 1]
            except IndexError:
                timetable.next_stop = timetables[0]
            await db.update(timetable)

        # link first timetable to route
        route.timetable = timetables[0]
        await db.update(route)
        return route.id

    @require_auth(permissions=["create_route"])
    async def on_set_route_active(self, sid, _, route_id, active):
        """
        Set route as active or inactive. Ignores if invalid id.

        schema: [int, bool]:
            route_id, active: Set route with `route_id` as `active`.
        """
        route = await db.get(Route, id=route_id)
        route.active = active
        await db.update(route)
