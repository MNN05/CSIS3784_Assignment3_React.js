export const GAME_COLORS = ["Blue", "Pink", "Purple", "Yellow", "Green"];

export function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, v = max;
  let d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s * 100, v * 100];
}

export function classifyColor(h, s, v) {
  if (v < 20) return "Black";
  if (v > 85 && s < 20) return "White";
  if (s < 25 && v >= 20 && v <= 85) return "Gray";

  // Neon game colors
  if (h >= 170 && h < 190) return "Green";
  if (h >= 200 && h < 250) return "Blue";
  if (h >= 280 && h < 300) return "Purple";
  if (h >= 310 && h < 340) return "Pink";
  if (h >= 50 && h < 70) return "Yellow";

  return "Unknown";
}

export function startColorDetection(video, canvas, callback) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  const DETECT_WIDTH = 100;  // small detection canvas
  const DETECT_HEIGHT = 100;
  canvas.width = DETECT_WIDTH;
  canvas.height = DETECT_HEIGHT;

  let lastColor = null;

  function detect() {
    // draw the scaled-down video frame to the canvas
    ctx.drawImage(video, 0, 0, DETECT_WIDTH, DETECT_HEIGHT);

    const imageData = ctx.getImageData(0, 0, DETECT_WIDTH, DETECT_HEIGHT);
    const data = imageData.data;

    let r = 0, g = 0, b = 0;
    const sampleStep = 4 * 10; // sample every 10 pixels to reduce load
    let count = 0;

    for (let i = 0; i < data.length; i += sampleStep) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }

    r = r / count;
    g = g / count;
    b = b / count;

    const [h, s, v] = rgbToHsv(r, g, b);
    const color = classifyColor(h, s, v);

    // only update if color changed to reduce React re-renders
    if (color !== lastColor) {
      lastColor = color;
      callback(color, h, s, v);
    }

    requestAnimationFrame(detect);
  }

  detect();
}
