import io
from typing import Tuple

import cv2  # OpenCV‑Python
import numpy as np
from PIL import Image, ImageEnhance


def _pil_to_cv(image: Image.Image, force_rgb: bool = True) -> np.ndarray:
    """Convert a Pillow image to a CV‑compatible NumPy array."""
    if force_rgb:
        image = image.convert("RGB")
    return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)


def _cv_to_pil(mat: np.ndarray) -> Image.Image:
    """Convert a CV (BGR/GRAY) NumPy array back to Pillow RGB image."""
    if len(mat.shape) == 2:  # GRAY
        mat = cv2.cvtColor(mat, cv2.COLOR_GRAY2RGB)
    else:  # BGR → RGB
        mat = cv2.cvtColor(mat, cv2.COLOR_BGR2RGB)
    return Image.fromarray(mat)


# ────────────────────────────────────────────────────────────────────────────────
# MAIN ENTRY POINT
# ────────────────────────────────────────────────────────────────────────────────
def clean_image(image: Image.Image) -> Image.Image:
    """
    Clean & enhance a photo of a textbook page, optimized for high readability
    while preserving natural text appearance.

    This function intelligently detects image quality and only applies processing
    when needed. High-quality images like screenshots are minimally processed,
    while photos with uneven lighting receive adaptive enhancement.

    Returns
    -------
    PIL.Image.Image
        The cleaned, enhanced image with improved text readability
    """
    # Convert to OpenCV format
    cv_img = _pil_to_cv(image)

    # Convert to grayscale
    gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)

    # Detect if image is already high quality (like a screenshot)
    # Calculate image quality metrics
    blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()  # Measure blurriness
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    histogram = cv2.calcHist([gray], [0], None, [256], [0, 256])
    histogram_peaks = np.sum(histogram > np.mean(histogram) * 2)  # Count strong peaks

    # Check if image has characteristics of a screenshot (sharp, bimodal histogram)
    is_high_quality = blur_score > 500 and histogram_peaks < 10

    if is_high_quality:
        # For high-quality images, apply minimal processing
        # Just normalize contrast slightly
        p5, p95 = np.percentile(gray, [5, 95])
        normalized = np.clip((gray - p5) * 255.0 / (p95 - p5), 0, 255).astype(np.uint8)
        result = _cv_to_pil(normalized)

        # Very subtle enhancement
        result = ImageEnhance.Contrast(result).enhance(1.05)

    else:
        # For photos with uneven lighting, apply full processing pipeline

        # Apply adaptive histogram equalization to handle uneven lighting
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        equalized = clahe.apply(gray)

        # Apply denoising while preserving edges
        denoised = cv2.fastNlMeansDenoising(
            equalized, None, h=10, templateWindowSize=7, searchWindowSize=21
        )
        denoised = cv2.medianBlur(denoised, 3)

        # Apply adaptive thresholding to handle lighting gradients
        adaptive = cv2.adaptiveThreshold(
            denoised,
            255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY,
            blockSize=25,
            C=5,
        )

        # Apply morphological operations to clean up noise
        kernel = np.ones((2, 2), np.uint8)
        cleaned = cv2.morphologyEx(adaptive, cv2.MORPH_CLOSE, kernel)

        result = _cv_to_pil(cleaned)
        result = ImageEnhance.Sharpness(result).enhance(1.1)

    return result
