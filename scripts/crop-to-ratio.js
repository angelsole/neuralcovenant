#!/usr/bin/env node

const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

// ANSI colors for terminal
const colors = {
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
};

async function cropImage(inputPath, ratio = '16:9') {
  const ratioMap = {
    '16:9': { width: 16, height: 9 },
    '21:9': { width: 21, height: 9 },
    '4:3': { width: 4, height: 3 },
    '1:1': { width: 1, height: 1 }
  };

  const aspectRatio = ratioMap[ratio] || ratioMap['16:9'];
  
  try {
    // Get image metadata
    const metadata = await sharp(inputPath).metadata();
    const { width, height } = metadata;
    
    // Calculate new dimensions maintaining aspect ratio
    let newWidth, newHeight;
    
    if (width / height > aspectRatio.width / aspectRatio.height) {
      // Image is wider than target ratio, crop width
      newHeight = height;
      newWidth = Math.round(height * aspectRatio.width / aspectRatio.height);
    } else {
      // Image is taller than target ratio, crop height
      newWidth = width;
      newHeight = Math.round(width * aspectRatio.height / aspectRatio.width);
    }
    
    // Create output filename
    const parsed = path.parse(inputPath);
    const outputPath = path.join(
      parsed.dir,
      `${parsed.name}-${ratio.replace(':', 'x')}${parsed.ext}`
    );
    
    // Crop and save
    await sharp(inputPath)
      .resize(newWidth, newHeight, {
        position: 'center',
        fit: 'cover'
      })
      .toFile(outputPath);
    
    console.log(
      `${colors.green}✓${colors.reset} Cropped ${path.basename(inputPath)} to ${ratio} → ${path.basename(outputPath)}`
    );
    
    return outputPath;
  } catch (error) {
    console.error(
      `${colors.red}✗${colors.reset} Error cropping ${path.basename(inputPath)}: ${error.message}`
    );
    return null;
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log(`${colors.cyan}Usage: node crop-to-ratio.js <image-path> [ratio]${colors.reset}`);
    console.log(`${colors.cyan}Ratios: 16:9 (default), 21:9, 4:3, 1:1${colors.reset}`);
    console.log(`${colors.cyan}Example: node crop-to-ratio.js ../static/images/posts/hero.png 16:9${colors.reset}`);
    process.exit(0);
  }
  
  const imagePath = args[0];
  const ratio = args[1] || '16:9';
  
  cropImage(imagePath, ratio);
}

module.exports = { cropImage };