import fs from "node:fs";
import jpeg from "jpeg-js";
import { PNG } from "pngjs";

const raw = jpeg.decode(fs.readFileSync("public/brand/sur-logo.jpg"), { useTArray: true });
const { width, height, data } = raw;
const png = new PNG({ width, height });
const dark = new Uint8Array(width * height);
const seen = new Uint8Array(width * height);
const queue = new Uint32Array(width * height);
let head = 0;
let tail = 0;

function maxAt(index) {
  const i = index * 4;
  return Math.max(data[i], data[i + 1], data[i + 2]);
}

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const index = y * width + x;
    if ((x === 0 || y === 0 || x === width - 1 || y === height - 1) && maxAt(index) < 48) {
      seen[index] = 1;
      queue[tail] = index;
      tail += 1;
    }
  }
}

while (head < tail) {
  const index = queue[head];
  head += 1;
  dark[index] = 1;
  const x = index % width;
  const y = (index - x) / width;
  const neighbors = [];
  if (x > 0) neighbors.push(index - 1);
  if (x < width - 1) neighbors.push(index + 1);
  if (y > 0) neighbors.push(index - width);
  if (y < height - 1) neighbors.push(index + width);
  for (const next of neighbors) {
    if (!seen[next] && maxAt(next) < 78) {
      seen[next] = 1;
      queue[tail] = next;
      tail += 1;
    }
  }
}

let cleared = 0;
for (let index = 0; index < width * height; index += 1) {
  const i = index * 4;
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  png.data[i] = r;
  png.data[i + 1] = g;
  png.data[i + 2] = b;
  if (dark[index]) {
    const max = Math.max(r, g, b);
    png.data[i + 3] = max < 36 ? 0 : Math.round(((max - 36) / 42) * 255);
    cleared += 1;
  } else {
    png.data[i + 3] = 255;
  }
}

fs.writeFileSync("public/brand/sur-logo.png", PNG.sync.write(resized(png, 760)));
console.log(`${width}x${height} cleared ${cleared}`);

function resized(source, targetWidth) {
  const targetHeight = Math.max(1, Math.round((source.height * targetWidth) / source.width));
  const out = new PNG({ width: targetWidth, height: targetHeight });
  for (let y = 0; y < targetHeight; y += 1) {
    const y0 = Math.floor((y * source.height) / targetHeight);
    const y1 = Math.max(y0 + 1, Math.floor(((y + 1) * source.height) / targetHeight));
    for (let x = 0; x < targetWidth; x += 1) {
      const x0 = Math.floor((x * source.width) / targetWidth);
      const x1 = Math.max(x0 + 1, Math.floor(((x + 1) * source.width) / targetWidth));
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let count = 0;
      for (let sy = y0; sy < y1; sy += 1) {
        for (let sx = x0; sx < x1; sx += 1) {
          const i = (sy * source.width + sx) << 2;
          const alpha = source.data[i + 3] / 255;
          r += source.data[i] * alpha;
          g += source.data[i + 1] * alpha;
          b += source.data[i + 2] * alpha;
          a += alpha;
          count += 1;
        }
      }
      const j = (y * targetWidth + x) << 2;
      if (a === 0) {
        out.data[j + 3] = 0;
      } else {
        out.data[j] = Math.round(r / a);
        out.data[j + 1] = Math.round(g / a);
        out.data[j + 2] = Math.round(b / a);
        out.data[j + 3] = Math.round((a / count) * 255);
      }
    }
  }
  return out;
}
