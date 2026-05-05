// 아이콘 PNG 생성 스크립트 (sharp를 이용해 SVG → PNG 변환)
import sharp from 'sharp';
import { readFileSync } from 'fs';

const svg = readFileSync('./public/icon.svg');

const sizes = [
  { file: 'public/icon-192.png', size: 192 },
  { file: 'public/icon-512.png', size: 512 },
  { file: 'public/apple-touch-icon.png', size: 180 },
];

for (const { file, size } of sizes) {
  await sharp(svg).resize(size, size).png().toFile(file);
  console.log(`✅ ${file} (${size}x${size})`);
}
console.log('아이콘 생성 완료!');
