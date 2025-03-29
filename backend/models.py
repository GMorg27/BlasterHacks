from typing import Optional

from typing_extensions import Annotated

from pydantic import BaseModel, ConfigDict, Field
from pydantic.functional_validators import BeforeValidator

# Represents an ObjectId field in the database.
# It will be represented as a `str` on the model so that it can be serialized to JSON.
PyObjectId = Annotated[str, BeforeValidator(str)]


class UserModel(BaseModel):
    """
    Container for a user record.
    """
    # The primary key for the UserModel, stored as a `str` on the instance.
    # This will be aliased to `_id` when sent to MongoDB,
    # but provided as `id` in the API requests and responses.
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str = Field(...)
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "name": "Jane Doe",
            }
        },
    )


class UpdateUserModel(BaseModel):
    """
    Container for a user record.
    """
    name: Optional[str] = None
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "name": "Jane Doe",
            }
        },
    )


    class ICSFileModel(BaseModel):
        """
        Container for an uploaded ICS file.
        """
        file_content: str = Field(..., description="The content of the uploaded ICS file as a string.")
        model_config = ConfigDict(
            json_schema_extra={
                "example": {
                    "file_content": "BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:Meeting\nEND:VEVENT\nEND:VCALENDAR",
                }
            },
        )


class Assignment(BaseModel):
    """
    Container for an assignment record.
    """
    DateAndTime: str
    DueDate: str
    Description: str
    Title: str
    CourseNum: str
    URL: str
    exam: bool
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "DateAndTime": "2023-10-01T10:00:00",
                "DueDate": "2023-10-15",
                "Description": "Complete the project report.",
                "Title": "Project Report",
                "CourseNum": "CS101",
                "URL": "http://example.com/assignment",
                "exam": False,
            }
        },
    )


class UpdateAssignment(BaseModel):
    """
    Container for updating an assignment record.
    """
    DateAndTime: Optional[str] = None
    DueDate: Optional[str] = None
    Description: Optional[str] = None
    Title: Optional[str] = None
    CourseNum: Optional[str] = None
    URL: Optional[str] = None
    exam: Optional[bool] = None
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "DateAndTime": "2023-10-01T10:00:00",
                "DueDate": "2023-10-15",
                "Description": "Update the project report details.",
                "Title": "Updated Project Report",
                "CourseNum": "CS101",
                "URL": "http://example.com/updated-assignment",
                "exam": True,
            }
        },
    )