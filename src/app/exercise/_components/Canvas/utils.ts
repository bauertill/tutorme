import assert from "assert";
import { Canvg } from "canvg";

export type Point = {
  x: number;
  y: number;
};

export type Path = Point[];

export async function toDataUrl(
  svgElement: SVGSVGElement,
): Promise<string | null> {
  const pathElements = Array.from(svgElement.querySelectorAll("path"));
  if (pathElements.length === 0) return null;

  const p = 10;
  const bbox = svgElement.getBBox();
  const [x, y, width, height] = [
    bbox.x - p,
    bbox.y - p,
    bbox.width + p * 2,
    bbox.height + p * 2,
  ];

  // Create a new SVG element with the cropped viewBox
  const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  tempSvg.setAttribute("width", width.toString());
  tempSvg.setAttribute("height", height.toString());
  tempSvg.setAttribute("viewBox", `${x} ${y} ${width} ${height}`);

  const backgroundRect = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "rect",
  );
  backgroundRect.setAttribute("x", x.toString());
  backgroundRect.setAttribute("y", y.toString());
  backgroundRect.setAttribute("width", width.toString());
  backgroundRect.setAttribute("height", height.toString());
  backgroundRect.setAttribute("fill", "white");
  tempSvg.appendChild(backgroundRect);

  // Clone and append all path elements
  pathElements.forEach((path) => {
    const clone = path.cloneNode(true);
    const stroke = (clone as SVGElement).getAttribute("stroke");
    if (stroke) {
      (clone as SVGElement).setAttribute("stroke", "black");
    }
    tempSvg.appendChild(clone);
  });

  // Create a canvas element to draw on
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  assert(ctx, "Canvas context is not mounted");

  // Render the cropped SVG
  const v = await Canvg.from(ctx, tempSvg.outerHTML);
  await v.render();

  const url = canvas.toDataURL("image/webp");
  return url;
}

export function pathToSVGPathData(path: Path): string {
  let pathData = "";

  const firstPoint = path[0];
  if (!firstPoint) return pathData;
  pathData += `M${firstPoint.x},${firstPoint.y}`;

  // Use a curve fitting algorithm instead of straight lines
  if (path.length > 2) {
    // For each point (except first and last), create a smooth curve
    for (let i = 1; i < path.length - 1; i++) {
      const point = path[i];
      const nextPoint = path[i + 1];

      if (point && nextPoint) {
        // Use quadratic Bézier curve (Q) for smoother lines
        // Control point is the current point, and we go to the midpoint between current and next
        const midX = (point.x + nextPoint.x) / 2;
        const midY = (point.y + nextPoint.y) / 2;

        pathData += ` Q${point.x},${point.y} ${midX},${midY}`;
      }
    }

    // Add the last point with a line
    const lastPoint = path[path.length - 1];
    if (lastPoint) {
      pathData += ` L${lastPoint.x},${lastPoint.y}`;
    }
  } else {
    // If we have only 2 points or fewer, use simple lines
    for (let i = 1; i < path.length; i++) {
      const point = path[i];
      if (point) {
        pathData += ` L${point.x},${point.y}`;
      }
    }
  }
  return pathData;
}

export function screenToSVGCoordinates(
  svg: SVGSVGElement,
  screenX: number,
  screenY: number,
): Point {
  const svgPoint = svg.createSVGPoint();
  svgPoint.x = screenX;
  svgPoint.y = screenY;

  // Get the current transformation matrix and invert it
  const CTM = svg.getScreenCTM();
  if (!CTM) return { x: 0, y: 0 };

  const invertedCTM = CTM.inverse();
  const transformedPoint = svgPoint.matrixTransform(invertedCTM);

  return {
    x: transformedPoint.x,
    y: transformedPoint.y,
  };
}

export function preventDefaults(svg: SVGSVGElement) {
  svg.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
    },
    { passive: false },
  );
  svg.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
    },
    { passive: false },
  );
}
