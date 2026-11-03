from datetime import datetime, timezone
from fastapi import APIRouter, Request, status
from app.models.contact import (
    ContactPlaceholderRequest,
    ContactPlaceholderResponse,
    ContactSendRequest,
    ContactSendResponse,
)
from app.services.email_service import email_service
from app.core.rate_limiter import IPRateLimiter

router = APIRouter()
rate_limiter = IPRateLimiter(max_calls=3)


@router.post(
    "/contact/send",
    response_model=ContactSendResponse,
    status_code=status.HTTP_200_OK,
    tags=["Contact"]
)
async def send_contact(payload: ContactSendRequest, request: Request):
    rate_limiter.check(request)
    return await email_service.send(payload)


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
