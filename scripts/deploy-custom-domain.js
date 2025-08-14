#!/usr/bin/env node

/**
 * Custom Domain Deployment Script for PaySSD
 * 
 * This script helps verify and deploy the custom domain configuration
 * for PaySSD from payssd.onrender.com to payssd.com
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const CONFIG = {
  customDomain: 'payssd.com',
  renderDomain: 'payssd.onrender.com',
  expectedUrls: [
    'https://payssd.com',
    'https://payssd.com/api/health',
    'https://payssd.com/pricing',
    'https://payssd.com/api-documentation'
  ]
};

class CustomDomainDeployer {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.success = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '\x1b[36m[INFO]\x1b[0m',
      success: '\x1b[32m[SUCCESS]\x1b[0m',
      warning: '\x1b[33m[WARNING]\x1b[0m',
      error: '\x1b[31m[ERROR]\x1b[0m'
    };
    
    console.log(`${prefix[type]} ${timestamp} - ${message}`);
    
    if (type === 'error') this.errors.push(message);
    if (type === 'warning') this.warnings.push(message);
    if (type === 'success') this.success.push(message);
  }

  async checkFileExists(filePath) {
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  async verifyEnvironmentFiles() {
    this.log('Verifying environment configuration files...');
    
    const files = [
      { path: '.env.production', required: ['CLIENT_URL', 'APP_URL'] },
      { path: 'client/.env.production', required: ['REACT_APP_API_URL'] },
      { path: 'render.yaml', required: ['CLIENT_URL', 'REACT_APP_API_URL', 'APP_URL'] }
    ];

    for (const file of files) {
      const exists = await this.checkFileExists(file.path);
      if (!exists) {
        this.log(`Missing file: ${file.path}`, 'error');
        continue;
      }

      const content = await fs.promises.readFile(file.path, 'utf8');
      
      // Check for custom domain usage
      if (content.includes('payssd.onrender.com')) {
        this.log(`File ${file.path} still contains Render domain references`, 'warning');
      }
      
      if (content.includes('payssd.com')) {
        this.log(`File ${file.path} correctly configured for custom domain`, 'success');
      } else {
        this.log(`File ${file.path} missing custom domain configuration`, 'error');
      }
    }
  }

  async verifyCodeUpdates() {
    this.log('Verifying code updates...');
    
    const filesToCheck = [
      'client/src/pages/static/ApiDocumentationPage.js',
      'client/src/pages/static/IntegrationGuidePage.js',
      'client/src/pages/static/NotFoundPage.js',
      'client/src/App.js',
      'server.js'
    ];

    for (const file of filesToCheck) {
      const exists = await this.checkFileExists(file);
      if (!exists) {
        this.log(`Missing file: ${file}`, 'error');
        continue;
      }

      const content = await fs.promises.readFile(file, 'utf8');
      
      if (file.includes('ApiDocumentationPage') || file.includes('IntegrationGuidePage')) {
        if (content.includes('api.payssd.com')) {
          this.log(`${file} still contains old API domain`, 'warning');
        }
      }
      
      if (file === 'server.js' && content.includes('onrender.com')) {
        this.log('Server.js contains redirect middleware', 'success');
      }
      
      if (file === 'client/src/App.js' && content.includes('NotFoundPage')) {
        this.log('Custom 404 page configured', 'success');
      }
    }
  }

  async checkDNS() {
    this.log('Checking DNS configuration...');
    
    try {
      const { execSync } = require('child_process');
      
      // Check if nslookup is available
      try {
        const result = execSync(`nslookup ${CONFIG.customDomain}`, { encoding: 'utf8' });
        if (result.includes('216.24.57.1') || result.includes('onrender.com')) {
          this.log('DNS appears to be configured correctly', 'success');
        } else {
          this.log('DNS configuration may need verification', 'warning');
        }
      } catch (error) {
        this.log('Could not verify DNS (nslookup not available)', 'warning');
      }
    } catch (error) {
      this.log('DNS check failed', 'warning');
    }
  }

  async testEndpoints() {
    this.log('Testing endpoints...');
    
    for (const url of CONFIG.expectedUrls) {
      try {
        await this.makeRequest(url);
        this.log(`✓ ${url} is accessible`, 'success');
      } catch (error) {
        this.log(`✗ ${url} failed: ${error.message}`, 'error');
      }
    }
  }

  makeRequest(url) {
    return new Promise((resolve, reject) => {
      const request = https.get(url, { timeout: 10000 }, (response) => {
        if (response.statusCode >= 200 && response.statusCode < 400) {
          resolve(response);
        } else {
          reject(new Error(`HTTP ${response.statusCode}`));
        }
      });
      
      request.on('error', reject);
      request.on('timeout', () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  async generateReport() {
    this.log('\n=== DEPLOYMENT REPORT ===');
    
    if (this.success.length > 0) {
      this.log(`\n✅ Successful checks (${this.success.length}):`);
      this.success.forEach(msg => console.log(`   • ${msg}`));
    }
    
    if (this.warnings.length > 0) {
      this.log(`\n⚠️  Warnings (${this.warnings.length}):`);
      this.warnings.forEach(msg => console.log(`   • ${msg}`));
    }
    
    if (this.errors.length > 0) {
      this.log(`\n❌ Errors (${this.errors.length}):`);
      this.errors.forEach(msg => console.log(`   • ${msg}`));
    }
    
    const status = this.errors.length === 0 ? 'READY' : 'NEEDS ATTENTION';
    this.log(`\n🚀 Deployment Status: ${status}`);
    
    if (status === 'READY') {
      this.log('\n📋 Next Steps:');
      console.log('   1. Commit and push all changes to your repository');
      console.log('   2. Configure custom domain in Render dashboard');
      console.log('   3. Update DNS records with your domain registrar');
      console.log('   4. Wait for SSL certificate provisioning');
      console.log('   5. Test the live deployment');
    }
  }

  async run() {
    this.log('🚀 Starting PaySSD Custom Domain Deployment Check...');
    this.log(`Target Domain: ${CONFIG.customDomain}`);
    this.log(`Source Domain: ${CONFIG.renderDomain}\n`);
    
    await this.verifyEnvironmentFiles();
    await this.verifyCodeUpdates();
    await this.checkDNS();
    
    // Only test endpoints if DNS seems configured
    if (this.errors.length === 0) {
      await this.testEndpoints();
    }
    
    await this.generateReport();
    
    process.exit(this.errors.length > 0 ? 1 : 0);
  }
}

// Run the deployment checker
if (require.main === module) {
  const deployer = new CustomDomainDeployer();
  deployer.run().catch(error => {
    console.error('\x1b[31m[FATAL]\x1b[0m Deployment check failed:', error.message);
    process.exit(1);
  });
}

module.exports = CustomDomainDeployer;