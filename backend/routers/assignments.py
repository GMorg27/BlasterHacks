import os
import re

from fastapi import APIRouter, Body, HTTPException, Query, status
from pydantic import BaseModel

import motor.motor_asyncio

from models import AssignmentModel, UserModel

router = APIRouter(prefix="/assignments")

client = motor.motor_asyncio.AsyncIOMotorClient(os.environ["MONGODB_URL"])
db = client.get_database("blasterhacks")
user_collection = db.get_collection("users")


class UserCollection(BaseModel):
    users: list[UserModel]


@router.get(
    "/",
    response_description="Get all assignments for user",
    response_model=list[AssignmentModel],
    status_code=status.HTTP_200_OK,
    response_model_by_alias=False,
)
async def get_user_assignments(username: str = Query(...)):
    """
    POST request to upload a list of assignments from a file for the given user.
    """
    user = await db.users.find_one({"name": username})
    if user is None:
        raise HTTPException(status_code=404, detail=f"User {username} not found")
    
    return user["tasks"]

@router.post(
    "/upload",
    response_description="Upload list of assignments from string",
    response_model=list[AssignmentModel],
    status_code=status.HTTP_201_CREATED,
    response_model_by_alias=False,
)
async def upload_assignments(icsString: str = Body(...), username: str = Query(...)):
    """
    POST request to upload a list of assignments from a file for the given user.
    """
    user = await db.users.find_one({"name": username})
    if user is None:
        raise HTTPException(status_code=404, detail=f"User {username} not found")
    
    assignments = await parse_ICS(icsString)
    assignment_dicts = [assignment.model_dump() for assignment in assignments]
    await db.users.update_one(
        {"name": username},  
        {"$set": {"tasks": assignment_dicts}}  
    )
    
    return assignments


async def parse_ICS(icsString: str) -> list[AssignmentModel]:
    """
    Helper function to parse an ICS string.
    """
    new_assignments = []
    lines = icsString.splitlines()

    i = 0
    assignment = None
    while i < len(lines):
        line = lines[i]
        i += 1

        if line == "BEGIN:VEVENT":
            assignment = {}
        elif line == "END:VEVENT" and assignment is not None:
            new_assignments.append(AssignmentModel(**assignment))
            assignment = None
        elif assignment is not None:
            splitLoc = line.find(":")
            if splitLoc == -1:
                continue

            attr = line[:splitLoc]
            value = line[splitLoc+1:]
            courseNum = ""
            if attr == "DTSTART":
                assignment["dueDate"] = value
            elif attr == "DESCRIPTION":
                assignment["description"]  = value
            elif attr == "SUMMARY":
                courseNum = re.search(r'.*[\[.*\]]', value)
                assignment["courseNum"] = courseNum
                assignment["title"] = value
            elif attr == "URL;VALUE=URI":
                assignment["URL"] = value

    return new_assignments
