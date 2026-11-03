import asyncio
import logging
from fastapi import HTTPException
from app.core.config import settings
from app.models.contact import ContactSendRequest, ContactSendResponse

logger = logging.getLogger(__name__)


class EmailService:
    async def send(self, request: ContactSendRequest) -> ContactSendResponse:
        if not settings.RESEND_API_KEY:
            logger.warning("RESEND_API_KEY not set — skipping email delivery (mock mode).")
            return ContactSendResponse(
                status="mock",
                message="Email delivery skipped (no API key configured)"
            )
        try:
            import resend
            resend.api_key = settings.RESEND_API_KEY
            recipient = settings.RESEND_TO_EMAIL if settings.RESEND_TO_EMAIL else "delivered@resend.dev"
            html_body = f"""
            <html><body style="font-family: monospace; color: #111827; padding: 24px;">
            <h2>📬 New Portfolio Contact</h2>
            <p><strong>From:</strong> {request.name} ({request.email})</p>
            <p><strong>Preferred Date:</strong> {request.preferred_date or 'Not specified'}</p>
            <p><strong>Notes:</strong></p>
            <blockquote style="border-left:3px solid #7bb2ff; padding-left:12px;">
              {request.notes or 'No message provided.'}
            </blockquote>
            <hr/><small>Sent via Personal Portfolio Contact Gateway</small>
            </body></html>
            """
            params = {
                "from": "Portfolio <onboarding@resend.dev>",
                "to": [recipient],
                "subject": f"Portfolio Contact: Meeting Request from {request.name}",
                "html": html_body,
            }
            await asyncio.to_thread(resend.Emails.send, params)
            return ContactSendResponse(status="sent", message="Email delivered successfully")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Resend delivery failed: {e}")
            raise HTTPException(status_code=503, detail="Delivery failed. Please try again.")


email_service = EmailService()
