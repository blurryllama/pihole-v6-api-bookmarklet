const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');

console.log('Creating zip file...');

// Create a new zip file
const zip = new AdmZip();

// Get the dist directory path
const distPath = path.join(__dirname, '..', 'dist');

// Read all files from the dist directory
const distFiles = fs.readdirSync(distPath);

// Add each file to the zip
distFiles.forEach(file => {
  const filePath = path.join(distPath, file);
  const stats = fs.statSync(filePath);
  
  if (stats.isDirectory()) {
    // If it's a directory, add it recursively
    zip.addLocalFolder(filePath, file);
  } else {
    // If it's a file, add it directly
    zip.addLocalFile(filePath, '');
  }
});

// Write the zip file
const outputPath = path.join(__dirname, '..', 'pihole-v6-controller.zip');
zip.writeZip(outputPath);

console.log(`Zip file created at: ${outputPath}`); 