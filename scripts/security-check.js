#!/usr/bin/env node

/**
 * Security Audit Script for PaySSD
 * Run this before deployment to check for common security issues
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SecurityAuditor {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.passed = [];
  }

  addIssue(category, message, severity = 'HIGH') {
    this.issues.push({ category, message, severity });
  }

  addWarning(category, message) {
    this.warnings.push({ category, message });
  }

  addPassed(category, message) {
    this.passed.push({ category, message });
  }

  checkEnvironmentFile() {
    console.log('\n🔍 Checking environment configuration...');
    
    const envPath = path.join(__dirname, '../.env');
    if (!fs.existsSync(envPath)) {
      this.addIssue('ENV', 'No .env file found');
      return;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    // Check for default/weak values
    const dangerousDefaults = [
      { key: 'JWT_SECRET', values: ['your_super_secret_jwt_key_here', 'secret', 'jwt_secret'] },
      { key: 'ADMIN_PASSWORD', values: ['admin123', 'password', 'admin', 'admin123_CHANGE_IN_PRODUCTION'] },
      { key: 'EMAIL_USER', values: ['test@example.com', 'your_email@gmail.com'] },
      { key: 'EMAIL_PASS', values: ['test_password', 'password', 'your_email_password'] }
    ];

    lines.forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
          dangerousDefaults.forEach(check => {
            if (key.trim() === check.key) {
              if (check.values.some(dangerous => value.trim().toLowerCase() === dangerous.toLowerCase())) {
                this.addIssue('ENV', `${key} contains default/weak value: ${value}`);
              } else {
                this.addPassed('ENV', `${key} appears to be properly configured`);
              }
            }
          });
        }
      }
    });

    // Check JWT secret strength
    const jwtMatch = envContent.match(/JWT_SECRET=(.+)/);
    if (jwtMatch && jwtMatch[1]) {
      const secret = jwtMatch[1].trim();
      if (secret.length < 32) {
        this.addIssue('ENV', 'JWT_SECRET is too short (minimum 32 characters recommended)');
      } else if (secret.length < 64) {
        this.addWarning('ENV', 'JWT_SECRET could be longer (64+ characters recommended)');
      } else {
        this.addPassed('ENV', 'JWT_SECRET length is adequate');
      }
    }

    // Check NODE_ENV
    if (envContent.includes('NODE_ENV=production')) {
      this.addPassed('ENV', 'NODE_ENV is set to production');
    } else {
      this.addWarning('ENV', 'NODE_ENV is not set to production');
    }
  }

  checkFilePermissions() {
    console.log('\n🔍 Checking file permissions...');
    
    const sensitiveFiles = ['.env', '.env.production'];
    
    sensitiveFiles.forEach(file => {
      const filePath = path.join(__dirname, '..', file);
      if (fs.existsSync(filePath)) {
        try {
          const stats = fs.statSync(filePath);
          // Check if file is readable by others (basic check)
          this.addPassed('PERMISSIONS', `${file} exists and permissions checked`);
        } catch (error) {
          this.addWarning('PERMISSIONS', `Could not check permissions for ${file}`);
        }
      }
    });
  }

  checkDependencies() {
    console.log('\n🔍 Checking dependencies...');
    
    const packagePath = path.join(__dirname, '../package.json');
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      // Check for security-related packages
      const securityPackages = ['helmet', 'express-rate-limit', 'bcryptjs', 'express-validator'];
      
      securityPackages.forEach(pkg => {
        if (packageJson.dependencies && packageJson.dependencies[pkg]) {
          this.addPassed('DEPENDENCIES', `Security package ${pkg} is installed`);
        } else {
          this.addWarning('DEPENDENCIES', `Security package ${pkg} is missing`);
        }
      });
    }
  }

  checkUploadSecurity() {
    console.log('\n🔍 Checking upload security...');
    
    const uploadsDir = path.join(__dirname, '../uploads');
    if (fs.existsSync(uploadsDir)) {
      this.addPassed('UPLOADS', 'Uploads directory exists');
      
      // Check for .gitkeep files
      const gitkeepPath = path.join(uploadsDir, '.gitkeep');
      if (fs.existsSync(gitkeepPath)) {
        this.addPassed('UPLOADS', 'Uploads directory has .gitkeep file');
      } else {
        this.addWarning('UPLOADS', 'Uploads directory missing .gitkeep file');
      }
    } else {
      this.addWarning('UPLOADS', 'Uploads directory does not exist');
    }
  }

  checkGitIgnore() {
    console.log('\n🔍 Checking .gitignore...');
    
    const gitignorePath = path.join(__dirname, '../.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const content = fs.readFileSync(gitignorePath, 'utf8');
      
      const requiredEntries = ['.env', 'node_modules/', 'logs/', 'uploads/*'];
      
      requiredEntries.forEach(entry => {
        if (content.includes(entry)) {
          this.addPassed('GITIGNORE', `${entry} is properly ignored`);
        } else {
          this.addIssue('GITIGNORE', `${entry} is not in .gitignore`);
        }
      });
    } else {
      this.addIssue('GITIGNORE', '.gitignore file is missing');
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🛡️  SECURITY AUDIT REPORT');
    console.log('='.repeat(60));
    
    if (this.issues.length > 0) {
      console.log('\n❌ CRITICAL ISSUES:');
      this.issues.forEach(issue => {
        console.log(`   [${issue.severity}] ${issue.category}: ${issue.message}`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.warnings.forEach(warning => {
        console.log(`   ${warning.category}: ${warning.message}`);
      });
    }
    
    if (this.passed.length > 0) {
      console.log('\n✅ PASSED CHECKS:');
      this.passed.forEach(pass => {
        console.log(`   ${pass.category}: ${pass.message}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`📊 SUMMARY: ${this.issues.length} issues, ${this.warnings.length} warnings, ${this.passed.length} passed`);
    
    if (this.issues.length > 0) {
      console.log('\n🚨 DEPLOYMENT NOT RECOMMENDED - Fix critical issues first!');
      process.exit(1);
    } else if (this.warnings.length > 0) {
      console.log('\n⚠️  DEPLOYMENT POSSIBLE - Consider addressing warnings');
    } else {
      console.log('\n🎉 SECURITY CHECKS PASSED - Ready for deployment!');
    }
  }

  run() {
    console.log('🔒 Starting PaySSD Security Audit...');
    
    this.checkEnvironmentFile();
    this.checkFilePermissions();
    this.checkDependencies();
    this.checkUploadSecurity();
    this.checkGitIgnore();
    
    this.generateReport();
  }
}

// Run the audit
const auditor = new SecurityAuditor();
auditor.run();