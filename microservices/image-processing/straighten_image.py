import os
import cv2
import numpy as np
from PIL import Image


def straighten_image(image: Image.Image):
    """
    The image should be a scan of a document which is potentially rotated.
    Rotate the document such that the text is straight.

    Args:
        image (PIL.Image.Image): The input image

    Returns:
        numpy.ndarray: The straightened image
    """
    # Convert to grayscale
    img = np.array(image)

    # Find edges using Canny
    edges = cv2.Canny(img, 50, 150, apertureSize=3)

    # Use Hough Line Transform to detect lines
    lines = cv2.HoughLinesP(
        edges, 1, np.pi / 180, threshold=100, minLineLength=100, maxLineGap=10
    )

    if lines is None or len(lines) == 0:
        print("No lines detected, returning original image")
        return image

    # Calculate angles of the detected lines
    angles = []
    for line in lines:
        x1, y1, x2, y2 = line[0]
        if x2 - x1 == 0:  # Avoid division by zero
            continue
        angle = np.arctan2(y2 - y1, x2 - x1) * 180.0 / np.pi
        # We're interested in the angle of horizontal lines, which should be close to 0 or 180 degrees
        # Normalize angles to -90 to 90 degrees range
        if angle > 90:
            angle -= 180
        elif angle < -90:
            angle += 180
        angles.append(angle)
        print(f"Angle: {angle}")

    if not angles:
        print("No valid angles detected, returning original image")
        return image

    # Use median angle to avoid outliers
    median_angle = np.median(angles)

    # Rotate the image to correct the skew
    (h, w) = img.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, median_angle, 1.0)
    rotated = cv2.warpAffine(
        img, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE
    )

    # Convert back to PIL Image
    output_image = Image.fromarray(rotated)

    return output_image
