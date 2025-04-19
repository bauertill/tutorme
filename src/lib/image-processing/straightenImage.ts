import type { OpenCV } from "@opencvjs/types";

export async function straightenImage(
  file: File,
  cv: typeof OpenCV,
): Promise<File> {
  try {
    // 2) Load image
    const img = await loadImage(file);

    // 3) Draw image on canvas
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Unable to get canvas context");
    }
    ctx.drawImage(img, 0, 0);

    // 4) OpenCV processing
    const src = cv.imread(canvas);

    // == Image straightening logic (mirroring your Python snippet) ==
    // (1) Convert to grayscale
    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    // (2) Apply Gaussian blur
    const blurred = new cv.Mat();
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);

    // (3) Apply threshold (binary inverse + Otsu)
    const thresh = new cv.Mat();
    cv.threshold(
      blurred,
      thresh,
      0,
      255,
      cv.THRESH_BINARY_INV + cv.THRESH_OTSU,
    );

    // (4) Find edges using Canny
    const edges = new cv.Mat();
    cv.Canny(thresh, edges, 50, 150, 3, false);

    // (5) Use Hough Line Transform to detect lines
    const lines = new cv.Mat();
    // parameters: edges, lines, rho=1, theta=Math.PI/180, threshold=100, minLineLength=100, maxLineGap=10
    cv.HoughLinesP(edges, lines, 1, Math.PI / 180, 100, 100, 10);

    // If no lines found, we simply continue without rotation
    if (!lines.data32S || lines.data32S.length === 0) {
      console.log("No lines detected, returning original image");
    } else {
      // (6) Calculate angles of the detected lines
      const angles: number[] = [];
      for (let i = 0; i < lines.rows; i++) {
        const x1 = lines.data32S[i * 4] ?? 0;
        const y1 = lines.data32S[i * 4 + 1] ?? 0;
        const x2 = lines.data32S[i * 4 + 2] ?? 0;
        const y2 = lines.data32S[i * 4 + 3] ?? 0;
        console.log("Line:", x1, y1, x2, y2);

        const dx = x2 - x1;
        const dy = y2 - y1;
        if (dx === 0) {
          // Avoid division by zero if x2 == x1
          continue;
        }

        // Angle in degrees
        let angle = (Math.atan2(dy, dx) * 180.0) / Math.PI;

        // Normalize angles to the range [-90, 90]
        if (angle > 90) {
          angle -= 180;
        } else if (angle < -90) {
          angle += 180;
        }
        angles.push(angle);
      }

      console.log("Angles:", angles);

      if (angles.length === 0) {
        console.log("No valid angles detected, returning original image");
      } else {
        // (7) Use median angle to avoid outliers
        angles.sort((a, b) => a - b);
        const mid = Math.floor(angles.length / 2);
        const medianAngle =
          angles.length % 2 !== 0
            ? (angles[mid] ?? 0)
            : ((angles[mid - 1] ?? 0) + (angles[mid] ?? 0)) / 2;
        console.log("Median angle:", medianAngle);

        // (8) Rotate the original color image to correct the skew
        const center = new cv.Point(
          Math.floor(src.cols / 2),
          Math.floor(src.rows / 2),
        );
        const M = cv.getRotationMatrix2D(center, medianAngle, 1.0);
        const rotated = new cv.Mat();
        cv.warpAffine(
          src,
          rotated,
          M,
          new cv.Size(src.cols, src.rows),
          cv.INTER_CUBIC,
          cv.BORDER_REPLICATE,
          new cv.Scalar(),
        );

        // Render the straightened image back onto the canvas
        cv.imshow(canvas, rotated);

        // Clean up
        rotated.delete();
      }
    }

    // Release all the intermediate Mats
    gray.delete();
    blurred.delete();
    thresh.delete();
    edges.delete();
    lines.delete();

    // 5) Convert canvas to Blob, then to File
    const blob = await canvasToBlob(canvas, "image/jpeg");
    const resultFile = new File(
      [blob],
      file.name.replace(/\.[^/.]+$/, "") + "_straight.jpg",
      {
        type: "image/jpeg",
      },
    );
    return resultFile;
  } catch (err) {
    console.error("Error in straightenImage:", err);
    throw err; // Rethrow to let caller handle it
  }
}

// Helper function to read a file as dataURL using async/await
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        resolve(reader.result as string);
      } else {
        reject(new Error("Unable to read file as dataURL"));
      }
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error("Unknown file reading error"));
    reader.readAsDataURL(file);
  });
}

// Helper function to load an Image using async/await
async function loadImage(file: File): Promise<HTMLImageElement> {
  const dataURL = await readFileAsDataURL(file);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) =>
      reject(err instanceof Error ? err : new Error(String(err as string)));
    img.src = dataURL;
  });
}

// Helper function to convert a canvas to blob using async/await
function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = "image/jpeg",
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create blob from canvas"));
        }
      },
      type,
      quality,
    );
  });
}
