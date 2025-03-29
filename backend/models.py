from typing import Optional

from typing_extensions import Annotated

from pydantic import BaseModel, ConfigDict, Field
from pydantic.functional_validators import BeforeValidator

# Represents an ObjectId field in the database.
# It will be represented as a `str` on the model so that it can be serialized to JSON.
PyObjectId = Annotated[str, BeforeValidator(str)]


class AssignmentModel(BaseModel):
    """
    Container for an assignment record.
    """
    dueDate: str | None = None
    description: str | None = None
    title: str
    URL: str
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "dueDate": "2023-10-15",
                "description": "Complete the project report.",
                "title": "Project Report",
                "URL": "http://example.com/assignment",
            }
        },
    )


class UserModel(BaseModel):
    """
    Container for a user record.
    """
    # The primary key for the UserModel, stored as a `str` on the instance.
    # This will be aliased to `_id` when sent to MongoDB,
    # but provided as `id` in the API requests and responses.
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str = Field(...)
    tasks: list[AssignmentModel] = Field(...)
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "name": "Jane Doe",
                "tasks": [],
            }
        },
    )


class UpdateUserModel(BaseModel):
    """
    Container for a user record.
    """
    name: Optional[str] = None
    tasks: list[AssignmentModel] = None
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "name": "Jane Doe",
                "tasks": [],
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