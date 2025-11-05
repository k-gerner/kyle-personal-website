import fs from "fs";
import path from "path";
import sharp from "sharp";

const inputDir = "./src/assets/ai"; // or wherever your images are
const outputDir = "./src/assets-optimized/ai";

// make sure output folder exists
fs.mkdirSync(outputDir, { recursive: true });

console.log(`🔄 Converting images in ${inputDir} to WebP format in ${outputDir}...`);
for (const file of fs.readdirSync(inputDir)) {
  const ext = path.extname(file).toLowerCase();
  if (![".png", ".jpg", ".jpeg"].includes(ext)) continue;

  const inputPath = path.join(inputDir, file);
  const base = path.basename(file, ext);

  await sharp(inputPath)
    .webp({ quality: 80 }) // adjust quality if you want smaller files
    .toFile(path.join(outputDir, `${base}.webp`));

  console.log(`✅ Converted ${file} → ${base}.webp`);
}
