from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_cors_allowed_origin():
    headers = {
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "GET"
    }
    response = client.options("/api/health", headers=headers)
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"


def test_cors_disallowed_origin():
    headers = {
        "Origin": "http://malicious-external-origin.com",
        "Access-Control-Request-Method": "GET"
    }
    response = client.options("/api/health", headers=headers)
    assert response.headers.get("access-control-allow-origin") != "http://malicious-external-origin.com"

