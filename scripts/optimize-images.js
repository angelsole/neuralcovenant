#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const glob = require('glob');
const { promisify } = require('util');
const globAsync = promisify(glob);

// Configuration
const CONFIG = {
  inputDir: '../static/images',
  outputDir: '../static/images',
  quality: 85, // WebP quality (0-100)
  keepOriginal: true, // Keep PNG files as fallback
  formats: {
    webp: { quality: 85, effort: 6 },
    avif: { quality: 80, effort: 6 } // Optional: AVIF for even better compression
  },
  sizes: {
    // Generate multiple sizes for responsive images
    hero: { width: 1792, height: 1024 },          // 16:9 for headers
    thumbnail: { width: 400, height: 225 },        // 16:9 for post lists
    inline: { width: 800, height: null },          // Maintain aspect ratio
    mobile: { width: 600, height: null }           // Mobile optimization
  }
};

// ANSI color codes for terminal output
const colors = {
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
};

async function convertImage(inputPath, options = {}) {
  const { format = 'webp', size = null, suffix = '' } = options;
  
  const parsedPath = path.parse(inputPath);
  const outputName = `${parsedPath.name}${suffix}.${format}`;
  const outputPath = path.join(
    path.dirname(inputPath),
    outputName
  );

  try {
    let pipeline = sharp(inputPath);
    
    // Apply size if specified
    if (size && CONFIG.sizes[size]) {
      const { width, height } = CONFIG.sizes[size];
      pipeline = pipeline.resize(width, height, {
        fit: 'cover',
        position: 'center',
        withoutEnlargement: true
      });
    }

    // Apply format-specific options
    if (format === 'webp') {
      pipeline = pipeline.webp(CONFIG.formats.webp);
    } else if (format === 'avif') {
      pipeline = pipeline.avif(CONFIG.formats.avif);
    }

    // Add metadata preservation
    pipeline = pipeline.withMetadata();

    await pipeline.toFile(outputPath);
    
    const inputStats = await fs.stat(inputPath);
    const outputStats = await fs.stat(outputPath);
    const reduction = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);
    
    console.log(
      `${colors.green}✓${colors.reset} ${path.basename(inputPath)} → ${outputName} ` +
      `${colors.cyan}(${reduction}% smaller)${colors.reset}`
    );
    
    return { success: true, outputPath, reduction };
  } catch (error) {
    console.error(
      `${colors.red}✗${colors.reset} Failed to convert ${path.basename(inputPath)}: ${error.message}`
    );
    return { success: false, error };
  }
}

async function generatePictureTag(imageName, alt) {
  // Generate HTML picture element for Hugo/markdown
  const baseUrl = '/images/posts/';
  
  return `<picture>
  <source srcset="${baseUrl}${imageName}-inline.avif" type="image/avif" media="(max-width: 800px)">
  <source srcset="${baseUrl}${imageName}.avif" type="image/avif">
  <source srcset="${baseUrl}${imageName}-inline.webp" type="image/webp" media="(max-width: 800px)">
  <source srcset="${baseUrl}${imageName}.webp" type="image/webp">
  <img src="${baseUrl}${imageName}.png" alt="${alt}" loading="lazy">
</picture>`;
}

async function processImages() {
  console.log(`${colors.cyan}🚀 Starting image optimization...${colors.reset}\n`);
  
  try {
    // Find all PNG images
    const pattern = `${CONFIG.inputDir}/**/*.png`;
    console.log(`Looking for files matching: ${pattern}`);
    let pngFiles = await globAsync(pattern);
    
    // Ensure pngFiles is always an array
    if (!pngFiles) {
      pngFiles = [];
    }
    
    if (pngFiles.length === 0) {
      console.log(`${colors.yellow}No PNG files found in ${CONFIG.inputDir}${colors.reset}`);
      console.log(`${colors.yellow}Place your PNG images in: static/images/posts/${colors.reset}`);
      return;
    }
    
    console.log(`Found ${colors.green}${pngFiles.length}${colors.reset} PNG files to process\n`);
    
    const results = {
      total: 0,
      successful: 0,
      totalReduction: 0
    };
    
    for (const file of pngFiles) {
      console.log(`${colors.cyan}Processing: ${path.basename(file)}${colors.reset}`);
      
      // Skip if already processed (has .webp version)
      const webpPath = file.replace('.png', '.webp');
      if (await fs.access(webpPath).then(() => true).catch(() => false)) {
        console.log(`${colors.yellow}  ↳ Skipping (already converted)${colors.reset}`);
        continue;
      }
      
      // Convert to WebP (main format)
      const webpResult = await convertImage(file, { format: 'webp' });
      
      // Optional: Convert to AVIF for better compression
      const avifResult = await convertImage(file, { format: 'avif' });
      
      // Generate responsive sizes for hero images
      if (file.includes('hero')) {
        await convertImage(file, { format: 'webp', size: 'thumbnail', suffix: '-thumb' });
        await convertImage(file, { format: 'avif', size: 'thumbnail', suffix: '-thumb' });
      }
      
      // Generate inline size for content images
      if (!file.includes('hero') && !file.includes('thumb')) {
        await convertImage(file, { format: 'webp', size: 'inline', suffix: '-inline' });
        await convertImage(file, { format: 'avif', size: 'inline', suffix: '-inline' });
      }
      
      results.total++;
      if (webpResult.success) {
        results.successful++;
        results.totalReduction += parseFloat(webpResult.reduction);
      }
      
      console.log(''); // Empty line for readability
    }
    
    // Summary
    console.log(`${colors.green}═══════════════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}✨ Optimization Complete!${colors.reset}`);
    console.log(`${colors.green}═══════════════════════════════════${colors.reset}`);
    console.log(`Total files processed: ${results.successful}/${results.total}`);
    console.log(`Average size reduction: ${(results.totalReduction / results.successful).toFixed(1)}%`);
    
    // Generate example picture tags
    console.log(`\n${colors.cyan}📝 Example usage in your markdown:${colors.reset}`);
    const exampleTag = await generatePictureTag('2025-06-13-hero', 'Hero image description');
    console.log(`\n${colors.yellow}${exampleTag}${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    console.error(`${colors.red}Stack: ${error.stack}${colors.reset}`);
    process.exit(1);
  }
}

// Add watch mode for development
if (process.argv.includes('--watch')) {
  const chokidar = require('chokidar');
  
  console.log(`${colors.cyan}👁  Watching for new PNG files...${colors.reset}\n`);
  
  const watcher = chokidar.watch(`${CONFIG.inputDir}/**/*.png`, {
    ignored: /^\./,
    persistent: true,
    ignoreInitial: true
  });
  
  watcher.on('add', async (filePath) => {
    console.log(`${colors.yellow}New file detected: ${path.basename(filePath)}${colors.reset}`);
    await convertImage(filePath, { format: 'webp' });
    await convertImage(filePath, { format: 'avif' });
  });
} else {
  // Run once
  processImages();
}