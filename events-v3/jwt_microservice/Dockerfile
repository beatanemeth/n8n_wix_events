# Use the official Python 3.11 slim image as the base.
FROM python:3.11-slim

# Set the working directory inside the container; all subsequent commands will run relative to this path.
WORKDIR /app

# Copy requirements.txt first to take advantage of Docker's layer caching.
# If it hasn't changed, the install step can be skipped in future builds.
COPY requirements.txt .

# Install Python dependencies without caching to reduce final image size.
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container.
COPY . .

# Run the FastAPI app using Uvicorn.
# 'app.main:app' points to the FastAPI instance.
# '--host 0.0.0.0' makes it accessible outside the container on port 8000.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
