/**
 * 生成 PWA 图标（PNG 格式）
 * - 192x192: Android 标准图标
 * - 512x512: Android 启动图标 / PWA 要求
 */
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SVG 源文件（使用统一的图标设计）
const SVG_TEMPLATE = (size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.167)}" fill="url(#bg)"/>
  <text x="${size/2}" y="${size * 0.625}" font-size="${size * 0.52}" text-anchor="middle" fill="white">📖</text>
</svg>`;

const OUTPUT_DIR = path.join(__dirname, '../public');

function generatePNG(size) {
  const svgString = SVG_TEMPLATE(size);
  const opts = {
    fitTo: {
      mode: 'width',
      value: size,
    },
  };
  
  const resvg = new Resvg(svgString, opts);
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  
  const outputPath = path.join(OUTPUT_DIR, `icon-${size}.png`);
  fs.writeFileSync(outputPath, pngBuffer);
  
  return outputPath;
}

function main() {
  console.log('🎨 生成 PWA 图标...\n');
  
  const sizes = [192, 512];
  
  sizes.forEach(size => {
    const outputPath = generatePNG(size);
    const fileSize = (fs.statSync(outputPath).size / 1024).toFixed(2);
    console.log(`✅ icon-${size}.png 已生成: ${outputPath}`);
    console.log(`   大小: ${fileSize} KB\n`);
  });
  
  // 更新 manifest.json 中的图标配置
  const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  
  // 添加 PNG 图标（放在 SVG 前面，优先使用 PNG）
  manifest.icons = [
    {
      src: '/icon-192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any maskable'
    },
    {
      src: '/icon-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable'
    },
    {
      src: '/icon-192.svg',
      sizes: '192x192',
      type: 'image/svg+xml',
      purpose: 'any'
    }
  ];
  
  // 更新 shortcuts 中的图标
  manifest.shortcuts = manifest.shortcuts.map(shortcut => ({
    ...shortcut,
    icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }]
  }));
  
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log('✅ manifest.json 已更新\n');
  
  console.log('✨ PWA 图标生成完成！');
}

main();
