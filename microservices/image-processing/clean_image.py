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
    Clean & enhance a photo of a textbook page so that the result looks like the
    original printed page: crisp black text on a clean white background.

    Steps
    -----
    1.  Convert to gray and apply CLAHE for local contrast boost.
    2.  Median‑blur to weaken isolated noise pixels.
    3.  Adaptive threshold → binarise text robustly under uneven lighting.
    4.  Morphology: open + close to drop pepper noise & fill tiny holes.
    5.  Dilate (1 px) to make strokes solid.
    6.  (Optional) automatic crop to remove dark vignette / border.
    7.  Mild global contrast tweak.

    Returns
    -------
    PIL.Image.Image
        The cleaned, RGB image.
    """
    # ---------------------------- 1–2. Pre‑process ----------------------------
    cv_img = _pil_to_cv(image)  # → BGR
    gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)  # → GRAY

    # CLAHE (local contrast equalisation)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    gray = clahe.apply(gray)

    # Light median blur to squash isolated sensor noise (radius 1)
    gray = cv2.medianBlur(gray, 3)

    # --------------------------- 3. Adaptive thresh ---------------------------
    bin_img = cv2.adaptiveThreshold(
        gray,
        maxValue=255,
        adaptiveMethod=cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        thresholdType=cv2.THRESH_BINARY_INV,  # we want text→white for morph ops
        blockSize=17,  # odd number; tweakable
        C=15,  # subtract from mean
    )

    # --------------------------- 4–5. Morphology ------------------------------
    kernel = np.ones((2, 2), np.uint8)
    bin_img = cv2.morphologyEx(bin_img, cv2.MORPH_OPEN, kernel, iterations=1)
    bin_img = cv2.morphologyEx(bin_img, cv2.MORPH_CLOSE, kernel, iterations=1)
    bin_img = cv2.dilate(bin_img, kernel, iterations=1)

    # Invert back → black text on white
    bin_img = cv2.bitwise_not(bin_img)

    # --------------------------- 6. Auto‑crop (optional) ----------------------
    def _autocrop(mat: np.ndarray, border_pad: int = 10) -> np.ndarray:
        """
        Remove thick black/very dark borders (vignettes). Works by finding the
        largest bright area and cropping to its bounding box.
        """
        # Pixels that are almost white in the *binarised* image
        bright_mask = bin_img > 250
        coords = cv2.findNonZero(bright_mask.astype(np.uint8) * 255)
        if coords is None:  # fallback: nothing to crop
            return mat
        x, y, w, h = cv2.boundingRect(coords)
        x = max(x - border_pad, 0)
        y = max(y - border_pad, 0)
        return mat[y : y + h + border_pad, x : x + w + border_pad]

    # Crop using the mask derived from bin_img
    bin_img = _autocrop(bin_img)
    # (We need the same crop applied to a grayscale/RGB version if downstream
    #  colour images are required. For this pipeline the bin_img is already the
    #  final rendition, so we're done.)

    # --------------------------- 7. Final touches -----------------------------
    pil_out = _cv_to_pil(bin_img)  # bin_img is GRAY→RGB

    # Subtle global contrast boost (already high contrast so keep gentle)
    pil_out = ImageEnhance.Contrast(pil_out).enhance(1.05)

    return pil_out
