import os
from flask import Flask, request, jsonify
from PIL import Image

from straighten_image import straighten_image
from crop_image import crop_image
from clean_image import clean_image
from upload import upload_to_blob_storage

app = Flask(__name__)


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy"}), 200


@app.route("/straighten-image", methods=["POST"])
def process_image():
    """
    A simple image processing endpoint that returns the image info.
    This is a placeholder for more complex image processing.
    """
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    print("Processing image")
    file = request.files["image"]
    img = Image.open(file.stream)
    print("Image opened")

    cleaned_image = clean_image(img)
    straightened_image = straighten_image(cleaned_image)
    cropped_image = crop_image(straightened_image)
    print("Image cropped")

    url = upload_to_blob_storage(cropped_image)
    print("Image uploaded", url, flush=True)

    return jsonify({"url": url})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
