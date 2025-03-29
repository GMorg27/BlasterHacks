import os
from fastapi import APIRouter, Body, status
import motor.motor_asyncio
from pydantic import BaseModel

from models import ICSFileModel

router = APIRouter(prefix="/icsFiles")

client = motor.motor_asyncio.AsyncIOMotorClient(os.environ["MONGODB_URL"])
db = client.get_database("blasterhacks")
ics_collection = db.get_collection("icsFiles")  # Ensure the collection name reflects ICS storage

class icsCollection(BaseModel):
    users: list[ICSFileModel]

@router.get(
    "/",
    response_description="List all ICS files",
    response_model=list[ICSFileModel],
    response_model_by_alias=False,
)
async def list_ics_files():
    """
    GET request to list all of the ICS files in the database.
    The
  response is unpaginated and limited to 1000 results.
      """
    return await ics_collection.find().to_list(length=1000)



@router.post(
    "/",
    response_description="Upload raw ICS file",
    status_code=status.HTTP_201_CREATED,
)
async def upload_ics_file(ics_data: ICSFileModel = Body(..., media_type="application/json")):
    """
    Accepts a raw ICS file string and stores it in MongoDB.
    """
    ics_entry = {"ics_data": ics_data}
    result = await ics_collection.insert_one(ics_entry)

    return {"message": "ICS file stored successfully", "inserted_id": str(result.inserted_id)}
