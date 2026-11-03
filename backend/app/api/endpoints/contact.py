from datetime import datetime, timezone
from fastapi import APIRouter, status
from app.models.contact import ContactPlaceholderRequest, ContactPlaceholderResponse

router = APIRouter()


@router.post(
    "/contact/placeholder",
    response_model=ContactPlaceholderResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Contact"]
)
async def submit_contact_placeholder(payload: ContactPlaceholderRequest):
    return ContactPlaceholderResponse(
        status="success",
        message=f"Thank you, {payload.name}! Your request has been recorded. Full email delivery activates in Milestone 2.",
        received_at=datetime.now(timezone.utc).isoformat()
    )

