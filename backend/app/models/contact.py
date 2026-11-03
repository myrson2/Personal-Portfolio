import re
from typing import Optional, Literal
from pydantic import BaseModel, Field, field_validator

EMAIL_REGEX = re.compile(r"^[\w\.-]+@[\w\.-]+\.\w+$")


class ContactPlaceholderRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=255)
    preferred_date: Optional[str] = Field(default=None)
    notes: Optional[str] = Field(default=None, max_length=1000)
    type: str = Field(default="meeting", pattern="^(meeting|general|community)$")

    @field_validator("email")
    @classmethod
    def validate_email_syntax(cls, v: str) -> str:
        if not EMAIL_REGEX.match(v.strip()):
            raise ValueError("Invalid email address format")
        return v.strip().lower()


class ContactPlaceholderResponse(BaseModel):
    status: str = "success"
    message: str
    received_at: str


class ContactSendRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=3, max_length=255)
    preferred_date: Optional[str] = Field(default=None, max_length=50)
    notes: Optional[str] = Field(default=None, max_length=2000)

    @field_validator("email")
    @classmethod
    def validate_email_syntax(cls, v: str) -> str:
        if not EMAIL_REGEX.match(v.strip()):
            raise ValueError("Invalid email address format")
        return v.strip().lower()


class ContactSendResponse(BaseModel):
    status: Literal["sent", "mock", "error"]
    message: str
