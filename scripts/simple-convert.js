#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const glob = require('glob');
const { promisify } = require('util');
const globAsync = promisify(glob);

// Simple PNG to WebP converter
async function convertToWebP(inputPath) {
  const outputPath = inputPath.replace('.png', '.webp');
  
  try {
    await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(outputPath);
    
    const inputStats = await fs.stat(inputPath);
    const outputStats = await fs.stat(outputPath);
    const reduction = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);
    
    console.log(`✓ ${path.basename(inputPath)} → ${path.basename(outputPath)} (${reduction}% smaller)`);
  } catch (error) {
    console.error(`✗ Failed to convert ${path.basename(inputPath)}: ${error.message}`);
  }
}

async function main() {
  const pngFiles = await globAsync('../static/images/**/*.png');
  
  for (const file of pngFiles) {
    // Skip if WebP already exists
    if (await fs.access(file.replace('.png', '.webp')).then(() => true).catch(() => false)) {
      continue;
    }
    
    await convertToWebP(file);
  }
}

main();