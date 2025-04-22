FROM python:3.13-slim

WORKDIR /app

# Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .

# Install OpenCV with pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy your project files
COPY . .

# Run your app
CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app"]
