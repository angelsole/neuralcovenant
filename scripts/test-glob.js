const { glob } = require('glob');
const path = require('path');

async function test() {
  console.log('Current directory:', process.cwd());
  console.log('Looking for:', path.resolve('../static/images/**/*.png'));
  
  try {
    const files = await glob('../static/images/**/*.png');
    console.log('Result type:', typeof files);
    console.log('Result:', files);
    console.log('Is array?', Array.isArray(files));
  } catch (error) {
    console.error('Error:', error);
  }
}

test();