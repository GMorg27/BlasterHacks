import os

import re

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
    assignments = icsString.splitlines()

    while(match):
      match = re.search(r"BEGIN:VEVENT", assignments)
      if match:
          assignmentCreated = re.search(r'DTSTAMP:([\d\d\d\d][\d\d][\d\d]T[\d\d][\d\d][\d\d]Z)', assignments[match.start():])
          if assignmentCreated:
              createdAssignment = assignmentCreated.group()
              print("Assignment Created: ", createdAssignment[1], createdAssignment[0] +",", createdAssignment[2] + " at " + createdAssignment[3] + ":" + createdAssignment[4] + " UTC Time")
          else:
              assignmentCreated = None
          assignmentDue = re.search(r'DTSTART;(VALUE=DATE)*;*:([\d\d\d\d][\d\d][\d\d])', assignments[match.start():])
          if assignmentDue:
              dueAssignment = assignmentDue.group()
              print("Assignment is due by: ", dueAssignment[1], dueAssignment[0] +",", dueAssignment[2] + " UTC Time")
          else:
              assignmentDue = None
          assignmentDescription = re.search(r'SUMMARY:([.*][Sequence:])', assignments[match.start():])
          if assignmentDescription:
              descriptionAssignment = assignmentDescription.group(1)
              print("Assignment Description: ", descriptionAssignment)
          else:
              assignmentDescription = None
          assignmentTitle = re.search(r'SUMMARY:([.*][\[.*\]])', assignments[match.start():])
          if assignmentTitle:
              titleAssignment = assignmentTitle.group(0)
              assignmentCourseNum = assignmentTitle.group(1)
              print("Assignment Title: ", titleAssignment + "Course Number: " + assignmentCourseNum)
              if "Exam" in titleAssignment or "Midterm" in titleAssignment or "Final" in titleAssignment:
                  examAssignment = True
              else:
                  examAssignment = False
          else:
              assignmentTitle = None
          assignmentURL = re.search(r'URL;VALUE=URI:([.*][END:])', assignments[match.start():])
          if assignmentURL:
              urlAssignment = assignmentURL.group(0)
              print("Assignment URL: ", urlAssignment)
          else:
              assignmentURL = None
      
          
          
    

    

    return new_assignments