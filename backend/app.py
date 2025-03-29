import os

from fastapi import FastAPI, Body, status

import motor.motor_asyncio

from pydantic import BaseModel

from models import UserModel

app = FastAPI(
    title="BlasterHacks",
    summary="Using FastAPI to add a ReST API to a MongoDB collection.",
)
client = motor.motor_asyncio.AsyncIOMotorClient(os.environ["MONGODB_URL"])
db = client.get_database("blasterhacks")
user_collection = db.get_collection("users")


class UserCollection(BaseModel):
    users: list[UserModel]


@app.get(
    "/users/",
    response_description="List all users",
    response_model=UserCollection,
    response_model_by_alias=False,
)
async def list_users():
    """
    List all of the user data in the database.
    The response is unpaginated and limited to 1000 results.
    """
    return UserCollection(users=await user_collection.find().to_list(1000))

@app.post(
    "/users/",
    response_description="Add new user",
    response_model=UserModel,
    status_code=status.HTTP_201_CREATED,
    response_model_by_alias=False,
)
async def create_user(user: UserModel = Body(...)):
    """
    Insert a new user record.
    A unique `id` will be created and provided in the response.
    """
    new_user = await user_collection.insert_one(
        user.model_dump(by_alias=True, exclude=["id"])
    )
    created_user = await user_collection.find_one(
        {"_id": new_user.inserted_id}
    )

    return created_user
