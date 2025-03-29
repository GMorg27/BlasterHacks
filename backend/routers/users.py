import os

from fastapi import APIRouter, Body, HTTPException, Query, status
from pydantic import BaseModel

import motor.motor_asyncio

from models import UserModel

router = APIRouter(prefix="/users")

client = motor.motor_asyncio.AsyncIOMotorClient(os.environ["MONGODB_URL"])
db = client.get_database("blasterhacks")
user_collection = db.get_collection("users")


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

@router.get(
    "/friends",
    response_description="Get all friends of user",
    response_model=list[UserModel],
    response_model_by_alias=False,
)
async def get_user_friends(username: str = Query(...)):
    """
    GET a list of all users that are friends of the current user.
    """
    friends = []

    user = await db.users.find_one({"name": username})
    if user is None:
        raise HTTPException(status_code=404, detail=f"User {username} not found")
    
    names = user["friends"]
    for name in names:
        friend = await db.users.find_one({"name": name})
        friends.append(friend)
    
    return friends


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

@router.post(
    "/friends",
    response_description="Add friendship between two users",
    response_model=None,
    status_code=status.HTTP_201_CREATED,
    response_model_by_alias=False,
)
async def add_friend(firstUser: str = Query(...), secondUser: str = Query(...)):
    """
    POST request to make two users friends.
    """
    if firstUser == secondUser:
        raise HTTPException(status_code=400, detail="Duplicate user names provided")

    first = await db.users.find_one({"name": firstUser})
    if first is None:
        raise HTTPException(status_code=404, detail=f"User {firstUser} not found")
    second = await db.users.find_one({"name": secondUser})
    if second is None:
        raise HTTPException(status_code=404, detail=f"User {secondUser} not found")

    firstFriends = set(first["friends"])
    firstFriends.add(secondUser)
    secondFriends = set(second["friends"])
    secondFriends.add(firstUser)

    await db.users.update_one(
        {"name": firstUser},  
        {"$set": {"friends": list(firstFriends)}}  
    )
    await db.users.update_one(
        {"name": secondUser},  
        {"$set": {"friends": list(secondFriends)}}  
    )
