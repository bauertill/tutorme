import cv2
import numpy as np
import os
from PIL import Image


def crop_image(image: Image.Image):
    """
    Crops an image containing a document scan to remove non-text/non-graphics areas.

    Args:
        image: PIL Image object

    Returns:
        Cropped image as a numpy array or None if operation fails
    """
    # Load the image
    img = np.array(image)

    # Make a copy of original image for final output
    original = img.copy()

    # Convert to grayscale if not already
    if len(img.shape) == 3:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    else:
        gray = img.copy()

    # Since we're assuming it's already high contrast binary,
    # we can skip bilateral filtering and thresholding

    # Apply morphological operations to connect nearby text
    kernel = np.ones((5, 5), np.uint8)
    dilated = cv2.dilate(gray, kernel, iterations=4)

    # Find contours (connected components)
    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # If no contours found, try a different approach
    if not contours:
        # Try Canny edge detection instead
        edges = cv2.Canny(gray, 50, 150)
        dilated_edges = cv2.dilate(edges, kernel, iterations=2)
        contours, _ = cv2.findContours(
            dilated_edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )

    # If still no significant contours, use MSER for text detection
    if not contours:
        mser = cv2.MSER_create()
        regions, _ = mser.detectRegions(gray)
        if regions:
            # Convert regions to contours
            contours = [np.array(region).reshape(-1, 1, 2) for region in regions]

    # If we still have no contours, return slightly reduced original
    if not contours:
        h, w = img.shape[:2]
        # Crop 5% from each side as a fallback
        border = int(min(h, w) * 0.05)
        return original[border : h - border, border : w - border]

    # Create mask of all contours
    mask = np.zeros_like(gray)
    for contour in contours:
        # Filter out very small contours which might be noise
        if cv2.contourArea(contour) > 100:
            cv2.drawContours(mask, [contour], -1, 255, -1)

    # Find the bounding rectangle that contains all content
    y, x = np.where(mask == 255)
    if len(x) == 0 or len(y) == 0:  # Safety check
        return original

    min_x, max_x = np.min(x), np.max(x)
    min_y, max_y = np.min(y), np.max(y)

    # Add some padding
    padding = int(min(img.shape[0], img.shape[1]) * 0.02)  # 2% of image size
    min_x = max(0, min_x - padding)
    min_y = max(0, min_y - padding)
    max_x = min(img.shape[1], max_x + padding)
    max_y = min(img.shape[0], max_y + padding)

    # Ensure we're not creating an empty crop
    if min_x >= max_x or min_y >= max_y:
        return original

    # Crop the original image
    cropped = original[min_y:max_y, min_x:max_x]

    return Image.fromarray(cropped)
