# Entrypoint for the image processing microservice

import cv2
import numpy as np
import os

from flask import Flask, request, jsonify
import base64
import io
from PIL import Image

app = Flask(__name__)


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy"}), 200


@app.route("/process-image", methods=["POST"])
def process_image():
    """
    A simple image processing endpoint that returns the image info.
    This is a placeholder for more complex image processing.
    """
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files["image"]
    img = Image.open(file.stream)

    # Get basic image information
    width, height = img.size
    format_type = img.format
    mode = img.mode

    return jsonify(
        {
            "message": "Hello World! Image processing service is working",
            "image_info": {
                "width": width,
                "height": height,
                "format": format_type,
                "mode": mode,
            },
        }
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
