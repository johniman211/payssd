#!/usr/bin/env node

// Render build script to ensure correct working directory
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('=== PaySSD Render Build Script ===');
console.log('Current working directory:', process.cwd());
console.log('Script location:', __dirname);

// Ensure we're in the project root
// Handle both local development and Render deployment paths
let projectRoot = __dirname;

// If we're in a 'src' subdirectory (Render deployment), go up one level
if (projectRoot.endsWith('/src') || projectRoot.endsWith('\\src')) {
    projectRoot = path.dirname(projectRoot);
    console.log('Detected src subdirectory, moving to parent:', projectRoot);
}

process.chdir(projectRoot);
console.log('Changed to project root:', process.cwd());

// Debug: List all files and directories in project root
console.log('\n=== Project Root Contents ===');
try {
    const items = fs.readdirSync(projectRoot);
    items.forEach(item => {
        const itemPath = path.join(projectRoot, item);
        const isDir = fs.statSync(itemPath).isDirectory();
        console.log(`${isDir ? '[DIR]' : '[FILE]'} ${item}`);
    });
} catch (error) {
    console.error('Error reading project root:', error.message);
}
console.log('=== End Contents ===\n');

// Verify client directory exists - check both project root and src subdirectory
let clientDir = path.join(projectRoot, 'client');
if (!fs.existsSync(clientDir)) {
    // Try looking in src subdirectory
    const srcClientDir = path.join(projectRoot, 'src', 'client');
    if (fs.existsSync(srcClientDir)) {
        clientDir = srcClientDir;
        console.log('✅ Found client directory in src subdirectory:', clientDir);
    } else {
        console.error('❌ Client directory not found at:', clientDir);
        console.error('❌ Also not found at:', srcClientDir);
        console.error('Available directories:', fs.readdirSync(projectRoot).filter(item => {
            try {
                return fs.statSync(path.join(projectRoot, item)).isDirectory();
            } catch { return false; }
        }));
        process.exit(1);
    }
} else {
    console.log('✅ Found client directory at project root:', clientDir);
}
console.log('✅ Client directory found at:', clientDir);

// Debug: List client directory contents
console.log('\n=== Client Directory Contents ===');
try {
    const clientItems = fs.readdirSync(clientDir);
    clientItems.forEach(item => {
        const itemPath = path.join(clientDir, item);
        const isDir = fs.statSync(itemPath).isDirectory();
        console.log(`${isDir ? '[DIR]' : '[FILE]'} ${item}`);
        
        // If it's the public directory, also list its contents
        if (isDir && item === 'public') {
            console.log('  === Public Directory Contents ===');
            try {
                const publicItems = fs.readdirSync(itemPath);
                publicItems.forEach(publicItem => {
                    console.log(`  [FILE] ${publicItem}`);
                });
            } catch (error) {
                console.error('  Error reading public directory:', error.message);
            }
            console.log('  === End Public Contents ===');
        }
    });
} catch (error) {
    console.error('Error reading client directory:', error.message);
}
console.log('=== End Client Contents ===\n');

// Verify client/public/index.html exists
const indexPath = path.join(clientDir, 'public', 'index.html');
if (!fs.existsSync(indexPath)) {
    console.error('❌ index.html not found at:', indexPath);
    
    // Check if public directory exists
    const publicDir = path.join(clientDir, 'public');
    if (!fs.existsSync(publicDir)) {
        console.error('❌ Public directory not found at:', publicDir);
        console.error('Available directories in client:', fs.readdirSync(clientDir).filter(item => {
            try {
                return fs.statSync(path.join(clientDir, item)).isDirectory();
            } catch { return false; }
        }));
    } else {
        console.error('❌ Public directory exists but index.html is missing');
        console.error('Files in public directory:', fs.readdirSync(publicDir));
    }
    process.exit(1);
}
console.log('✅ index.html found at:', indexPath);

try {
    // Install client dependencies
    console.log('\n📦 Installing client dependencies (including dev)...');
    execSync('npm install --include=dev', { 
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
