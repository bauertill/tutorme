from PIL import Image
from io import BytesIO
import requests
import os
from typing import Optional


def upload_to_blob_storage(image: Image.Image) -> Optional[str]:
    """
    Uploads the image to Vercel Blob storage and returns the URL.

    Args:
        image: PIL Image object to upload

    Returns:
        str: URL of the uploaded image if successful, None otherwise
    """
    try:
        # Convert PIL Image to bytes
        buffer = BytesIO()
        # Infer the format from the original image
        image_format = image.format
        if not image_format:
            image_format = "JPEG"  # Default to JPG if format is not available
        image.save(buffer, format=image_format)
        buffer.seek(0)

        # Get blob storage token from environment
        blob_token = os.getenv("BLOB_READ_WRITE_TOKEN")
        if not blob_token:
            raise ValueError("BLOB_READ_WRITE_TOKEN environment variable not set")

        # Generate a unique filename
        filename = f"image.{image_format.lower()}"

        # Upload to Vercel Blob
        response = requests.put(
            f"https://blob.vercel-storage.com/{filename}",
            headers={
                "Authorization": f"Bearer {blob_token}",
                "Content-Type": f"image/{image_format.lower()}",
            },
            data=buffer.getvalue(),
        )

        if response.status_code == 200:
            return response.json().get("url")
        else:
            print(f"Failed to upload image: {response.text}")
            return None

    except Exception as e:
        print(f"Error uploading image: {str(e)}")
        return None
