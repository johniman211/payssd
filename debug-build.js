// Debug script to check build paths and environment
console.log('=== Build Environment Debug ===');
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('Process argv:', process.argv);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('\n=== File System Check ===');

const fs = require('fs');
const path = require('path');

// Check if client directory exists
const clientDir = path.join(process.cwd(), 'client');
console.log('Client directory exists:', fs.existsSync(clientDir));

// Check if client/public exists
const publicDir = path.join(clientDir, 'public');
console.log('Client/public directory exists:', fs.existsSync(publicDir));

// Check if index.html exists
const indexPath = path.join(publicDir, 'index.html');
console.log('index.html exists:', fs.existsSync(indexPath));
console.log('index.html path:', indexPath);

// Check if client/package.json exists
const clientPackageJson = path.join(clientDir, 'package.json');
console.log('Client package.json exists:', fs.existsSync(clientPackageJson));

if (fs.existsSync(clientPackageJson)) {
    const packageData = JSON.parse(fs.readFileSync(clientPackageJson, 'utf8'));
    console.log('Client package name:', packageData.name);
    console.log('Client scripts:', Object.keys(packageData.scripts || {}));
}

console.log('\n=== Directory Contents ===');
try {
    console.log('Root directory contents:', fs.readdirSync(process.cwd()));
    if (fs.existsSync(clientDir)) {
        console.log('Client directory contents:', fs.readdirSync(clientDir));
    }
    if (fs.existsSync(publicDir)) {
        console.log('Public directory contents:', fs.readdirSync(publicDir));
    }
} catch (error) {
    console.error('Error reading directories:', error.message);
}