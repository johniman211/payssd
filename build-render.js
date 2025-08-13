#!/usr/bin/env node

// Render build script to ensure correct working directory
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('=== PaySSD Render Build Script ===');
console.log('Current working directory:', process.cwd());
console.log('Script location:', __dirname);

// Ensure we're in the project root
const projectRoot = __dirname;
process.chdir(projectRoot);
console.log('Changed to project root:', process.cwd());

// Verify client directory exists
const clientDir = path.join(projectRoot, 'client');
if (!fs.existsSync(clientDir)) {
    console.error('❌ Client directory not found at:', clientDir);
    process.exit(1);
}
console.log('✅ Client directory found at:', clientDir);

// Verify client/public/index.html exists
const indexPath = path.join(clientDir, 'public', 'index.html');
if (!fs.existsSync(indexPath)) {
    console.error('❌ index.html not found at:', indexPath);
    process.exit(1);
}
console.log('✅ index.html found at:', indexPath);

try {
    // Install client dependencies
    console.log('\n📦 Installing client dependencies...');
    execSync('npm install', { 
        cwd: clientDir, 
        stdio: 'inherit',
        env: { ...process.env, PWD: clientDir }
    });
    
    // Build client
    console.log('\n🔨 Building React client...');
    execSync('npm run build', { 
        cwd: clientDir, 
        stdio: 'inherit',
        env: { ...process.env, PWD: clientDir }
    });
    
    // Verify build output
    const buildDir = path.join(clientDir, 'build');
    const buildIndexPath = path.join(buildDir, 'index.html');
    
    if (fs.existsSync(buildIndexPath)) {
        console.log('\n✅ Build successful! Build files created at:', buildDir);
        console.log('✅ Build index.html found at:', buildIndexPath);
    } else {
        console.error('\n❌ Build failed! No build output found.');
        process.exit(1);
    }
    
} catch (error) {
    console.error('\n❌ Build failed with error:', error.message);
    process.exit(1);
}

console.log('\n🎉 Build completed successfully!');