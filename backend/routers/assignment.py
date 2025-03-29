import os

from fastapi import APIRouter, Body, status
from pydantic import BaseModel

import motor.motor_asyncio

from models import AssignmentModel

router = APIRouter(prefix="/assignments")

@router.post(
    "/upload",
    response_description="Upload list of assignments from string",
    response_model=list[AssignmentModel],
    status_code=status.HTTP_201_CREATED,
    response_model_by_alias=False,
)
async def upload_assignments(icsString: str = Body(...)):
    """
    POST request to upload a list of assignments from a file.
    """
    new_assignments = []

    return new_assignments