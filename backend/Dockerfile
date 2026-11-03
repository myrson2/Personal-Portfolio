# backend/Dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install uv (Python package manager)
RUN pip install uv

# Copy and install dependencies
COPY requirements.txt ./
RUN uv pip install --system -r requirements.txt

# Copy application source
COPY . .

EXPOSE 8000

# Start FastAPI with Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

