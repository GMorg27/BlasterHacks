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
    GET request to upload a list of assignments from a file for the given user.
    """
    user = await db.users.find_one({"name": username})
    if user is None:
        raise HTTPException(status_code=404, detail=f"User {username} not found")

    return user["tasks"]

@router.post(
    "/update",
    response_description="Update list of assignments from string",
    response_model=list[AssignmentModel],
    status_code=status.HTTP_201_CREATED,
    response_model_by_alias=False,
)
async def update_assignments(assignments: list[AssignmentModel] = Body(...), username: str = Query(...)): 
    """
    POST request to update a the list of assignments for the given user.
    """
    user = await db.users.find_one({"name": username})
    if user is None:
        raise HTTPException(status_code=404, detail=f"User {username} not found")

    db.users.update_one(
        {"name": username},  
        {"$set": {"tasks": [assignment.model_dump() for assignment in assignments]}}  
    )
    user = await db.users.find_one({"name": username})
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
    Parses an ICS string and extracts assignments.
    """
    new_assignments = []
    assignment = {}
    
    
    
    # Find all VEVENT sections
    events = re.findall(r"BEGIN:VEVENT(.*?)END:VEVENT", icsString, re.S)
    
    for event in events:
        # Extract due date
        assignment_due = re.search(r"DTSTART;.*:(\d+)", event)
        assignment["dueDate"] = assignment_due.group(1) if assignment_due else None

        # Extract summary (title)
        assignment_title = re.search(r"SUMMARY:(.+)", event)
        assignment["title"] = assignment_title.group(1) if assignment_title else None

        # Extract description
        assignment_description = re.search(r"DESCRIPTION:(.+?)(?=\n[A-Z-]+:|$)", event, re.S)
        
        assignment["description"] = ((assignment_description.group(1).replace("\n", "").replace("\\n", "").replace("*", "").replace("\\", "").replace("\0", "")[:125])+"..." if len(assignment_description.group(1).replace("\n", "").replace("\\n", "").replace("*", "").replace("\\", "").replace("\0", "")) > 125 else assignment_description.group(1).replace("\n", "").replace("\\n", "").replace("*", "").replace("\\", "").replace("\0", "")) if assignment_description else None

        # Extract course number (if present in brackets)
        course_match = re.search(r"SUMMARY:(.+)\[(.*?)\]", event) if event else None
        assignment["courseNum"] = course_match.group(1) if course_match else None

        # Extract URL
        assignment_url = re.search(r"URL;VALUE=URI:(.+)", event)
        assignment["URL"] = assignment_url.group(1) if assignment_url else None

        # Determine if it's an exam
        is_exam = any(word in assignment_title.group() for word in ["Exam", "Midterm", "Final"]) if assignment_title else False

        # Create an AssignmentModel instance
        new_assignments.append(AssignmentModel(**assignment))

        assignment = {}

    return new_assignments

