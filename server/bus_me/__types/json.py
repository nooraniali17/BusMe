from typing import Dict, List, Optional, Union

__all__ = ["JSONObject", "JSONList", "JSONDict"]

JSONObject = Optional[Union[str, int, float, bool, "JSONList", "JSONDict"]]
JSONList = List[JSONObject]
JSONDict = Dict[str, JSONObject]
