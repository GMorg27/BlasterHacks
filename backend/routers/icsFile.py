import os

from fastapi import APIRouter, Body, status
from pydantic import BaseModel

import motor.motor_asyncio

from models import ICSFileModel

router = APIRouter(prefix="/users")

client = motor.motor_asyncio.AsyncIOMotorClient(os.environ["MONGODB_URL"])
db = client.get_database("blasterhacks")



class UserCollection(BaseModel):
    users: list[UserModel]


@router.get(
    "/",
    response_description="List all users",
    response_model=list[UserModel],
    response_model_by_alias=False,
)
async def list_users():
    """
    GET request to list all of the user data in the database.
    The response is unpaginated and limited to 1000 results.
    """
    return await user_collection.find().to_list(length=1000)

@router.post(
    "/",
    response_description="Add new user",
    response_model=UserModel,
    status_code=status.HTTP_201_CREATED,
    response_model_by_alias=False,
)
async def create_user(user: UserModel = Body(...)):
    """
    POST request to insert a new user record.
    A unique `id` will be created and provided in the response.
    """
    new_user = await user_collection.insert_one(
        user.model_dump(by_alias=True, exclude=["id"])
    )
    created_user = await user_collection.find_one(
        {"_id": new_user.inserted_id}
    )

    return created_user
