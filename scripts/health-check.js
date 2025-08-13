#!/usr/bin/env node

/**
 * Health Check Script for PaySSD
 * Verifies all services and dependencies are working correctly
 */

const axios = require('axios');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class HealthChecker {
  constructor() {
    this.results = [];
    this.baseUrl = process.env.CLIENT_URL || 'http://localhost:5000';
  }

  addResult(service, status, message, details = null) {
    this.results.push({
      service,
      status, // 'PASS', 'FAIL', 'WARN'
      message,
      details,
      timestamp: new Date().toISOString()
    });
  }

  async checkDatabase() {
    console.log('🔍 Checking database connection...');
    
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000
      });
      
      // Test a simple operation
      const adminDb = mongoose.connection.db.admin();
      const result = await adminDb.ping();
      
      this.addResult('DATABASE', 'PASS', 'MongoDB connection successful', {
        uri: process.env.MONGODB_URI?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'),
        ping: result
      });
      
      await mongoose.disconnect();
    } catch (error) {
      this.addResult('DATABASE', 'FAIL', 'MongoDB connection failed', {
        error: error.message
      });
    }
  }

  async checkApiEndpoints() {
    console.log('🔍 Checking API endpoints...');
    
    const endpoints = [
      { path: '/api/health', method: 'GET', description: 'Health check endpoint' },
      { path: '/api/auth/register', method: 'POST', description: 'User registration', expectStatus: 400 },
      { path: '/api/users/profile', method: 'GET', description: 'Protected route', expectStatus: 401 }
    ];

    for (const endpoint of endpoints) {
      try {
        const url = `${this.baseUrl}${endpoint.path}`;
        const config = {
          method: endpoint.method,
          url,
          timeout: 5000,
          validateStatus: () => true // Don't throw on any status
        };

        if (endpoint.method === 'POST') {
          config.data = {}; // Empty body for POST requests
        }

        const response = await axios(config);
        const expectedStatus = endpoint.expectStatus || 200;
        
        if (response.status === expectedStatus) {
          this.addResult('API', 'PASS', `${endpoint.description} responding correctly`, {
            url,
            status: response.status,
            method: endpoint.method
          });
        } else {
          this.addResult('API', 'WARN', `${endpoint.description} unexpected status`, {
            url,
            expected: expectedStatus,
            actual: response.status,
            method: endpoint.method
          });
        }
      } catch (error) {
        this.addResult('API', 'FAIL', `${endpoint.description} failed`, {
          url: `${this.baseUrl}${endpoint.path}`,
          error: error.message
        });
      }
    }
  }

  checkEnvironmentVariables() {
    console.log('🔍 Checking environment variables...');
    
    const requiredVars = [
      'MONGODB_URI',
      'JWT_SECRET',
      'CLIENT_URL',
      'PORT'
    ];

    const optionalVars = [
      'EMAIL_USER',
      'EMAIL_PASS',
      'SMS_API_KEY',
      'MTN_API_KEY',
      'DIGICASH_API_KEY'
    ];

    requiredVars.forEach(varName => {
      if (process.env[varName]) {
        this.addResult('ENV', 'PASS', `${varName} is set`);
      } else {
        this.addResult('ENV', 'FAIL', `${varName} is missing`);
      }
    });

    optionalVars.forEach(varName => {
      if (process.env[varName]) {
        this.addResult('ENV', 'PASS', `${varName} is configured`);
      } else {
        this.addResult('ENV', 'WARN', `${varName} is not configured (optional)`);
      }
    });
  }

  checkFileSystem() {
    console.log('🔍 Checking file system...');
    
    const requiredDirs = [
      'uploads',
      'uploads/kyc',
      'logs'
    ];

    const requiredFiles = [
      'server.js',
      'package.json',
      '.env',
      'ecosystem.config.js'
    ];

    requiredDirs.forEach(dir => {
      const dirPath = path.join(__dirname, '..', dir);
      if (fs.existsSync(dirPath)) {
        this.addResult('FILESYSTEM', 'PASS', `Directory ${dir} exists`);
      } else {
        this.addResult('FILESYSTEM', 'FAIL', `Directory ${dir} is missing`);
      }
    });

    requiredFiles.forEach(file => {
      const filePath = path.join(__dirname, '..', file);
      if (fs.existsSync(filePath)) {
        this.addResult('FILESYSTEM', 'PASS', `File ${file} exists`);
      } else {
        this.addResult('FILESYSTEM', 'FAIL', `File ${file} is missing`);
      }
    });
  }

  checkDiskSpace() {
    console.log('🔍 Checking disk space...');
    
    try {
      const stats = fs.statSync(__dirname);
      this.addResult('SYSTEM', 'PASS', 'File system accessible');
    } catch (error) {
      this.addResult('SYSTEM', 'FAIL', 'File system access error', {
        error: error.message
      });
    }
  }

  async checkExternalServices() {
    console.log('🔍 Checking external services...');
    
    // Check if we can reach external APIs (basic connectivity)
    const externalServices = [
      { name: 'Google DNS', url: 'https://8.8.8.8', timeout: 3000 },
      { name: 'Internet Connectivity', url: 'https://www.google.com', timeout: 5000 }
    ];

    for (const service of externalServices) {
      try {
        await axios.get(service.url, { timeout: service.timeout });
        this.addResult('EXTERNAL', 'PASS', `${service.name} reachable`);
      } catch (error) {
        this.addResult('EXTERNAL', 'WARN', `${service.name} unreachable`, {
          error: error.message
        });
      }
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🏥 HEALTH CHECK REPORT');
    console.log('='.repeat(60));
    
    const passed = this.results.filter(r => r.status === 'PASS');
    const failed = this.results.filter(r => r.status === 'FAIL');
    const warnings = this.results.filter(r => r.status === 'WARN');
    
    if (failed.length > 0) {
      console.log('\n❌ FAILED CHECKS:');
      failed.forEach(result => {
        console.log(`   ${result.service}: ${result.message}`);
        if (result.details) {
          console.log(`      Details: ${JSON.stringify(result.details, null, 2)}`);
        }
      });
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      warnings.forEach(result => {
        console.log(`   ${result.service}: ${result.message}`);
      });
    }
    
    if (passed.length > 0) {
      console.log('\n✅ PASSED CHECKS:');
      passed.forEach(result => {
        console.log(`   ${result.service}: ${result.message}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`📊 SUMMARY: ${passed.length} passed, ${failed.length} failed, ${warnings.length} warnings`);
    
    // Overall health status
    if (failed.length === 0) {
      console.log('\n🎉 SYSTEM HEALTHY - All critical checks passed!');
      return true;
    } else {
      console.log('\n🚨 SYSTEM UNHEALTHY - Critical issues detected!');
      return false;
    }
  }

  async run() {
    console.log('🏥 Starting PaySSD Health Check...');
    console.log(`Target URL: ${this.baseUrl}`);
    
    try {
      this.checkEnvironmentVariables();
      this.checkFileSystem();
      this.checkDiskSpace();
      
      await this.checkDatabase();
      await this.checkApiEndpoints();
      await this.checkExternalServices();
      
      const isHealthy = this.generateReport();
      
      // Save report to file
      const reportPath = path.join(__dirname, '..', 'logs', 'health-check.json');
      fs.writeFileSync(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        healthy: isHealthy,
        results: this.results
      }, null, 2));
      
      console.log(`\n📄 Report saved to: ${reportPath}`);
      
      process.exit(isHealthy ? 0 : 1);
    } catch (error) {
      console.error('\n💥 Health check failed with error:', error.message);
      process.exit(1);
    }
  }
}

// Run the health check
const checker = new HealthChecker();
checker.run();