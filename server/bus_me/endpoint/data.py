from ..entities import db, Route, Stop, Timetable
from .login import LoginNamespace

__all__ = ["DataNamespace"]


class DataNamespace(LoginNamespace):
    """Namespace for public (permissionless) data queries. """

    async def on_stop_data(self, sid, stop_id):
        """
        Get stop data.

        schema: int: Stop ID, given by `sub_stops`.

        returns: int[]: List of time tables at this stop by ID.
        TODO: fill out return schema
        """
        tr_query = await db.prefetch(
            Timetable.select().join(Stop).where(Stop.id == stop_id), Route.select()
        )

        return {
            tr.id: {
                "route": tr.route.id,
                "expected_duration": tr.expected_duration.seconds,
            }
            for tr in tr_query
        }
