#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Tactical Annotation App - Project Health Check\n');

const checks = {
  backend: {
    name: 'Backend (NestJS)',
    status: '❌',
    issues: []
  },
  frontend: {
    name: 'Frontend (Angular)',
    status: '❌',
    issues: []
  },
  mockAi: {
    name: 'Mock AI Service',
    status: '❌',
    issues: []
  },
  database: {
    name: 'Database Schema',
    status: '❌',
    issues: []
  },
  documentation: {
    name: 'Documentation',
    status: '❌',
    issues: []
  }
};

// Check Backend
function checkBackend() {
  const backendPath = path.join(__dirname, 'Backend');
  
  if (!fs.existsSync(backendPath)) {
    checks.backend.issues.push('Backend directory not found');
    return;
  }

  // Check package.json
  const packageJsonPath = path.join(backendPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    checks.backend.issues.push('package.json not found');
    return;
  }

  // Check src directory
  const srcPath = path.join(backendPath, 'src');
  if (!fs.existsSync(srcPath)) {
    checks.backend.issues.push('src directory not found');
    return;
  }

  // Check main files
  const mainFiles = ['main.ts', 'app.module.ts', 'app.controller.ts'];
  mainFiles.forEach(file => {
    if (!fs.existsSync(path.join(srcPath, file))) {
      checks.backend.issues.push(`${file} not found`);
    }
  });

  // Check Prisma schema
  const prismaPath = path.join(backendPath, 'prisma');
  if (!fs.existsSync(prismaPath)) {
    checks.backend.issues.push('prisma directory not found');
  } else {
    const schemaPath = path.join(prismaPath, 'schema.prisma');
    if (!fs.existsSync(schemaPath)) {
      checks.backend.issues.push('schema.prisma not found');
    }
  }

  // Check environment example
  const envExamplePath = path.join(backendPath, 'env.example');
  if (!fs.existsSync(envExamplePath)) {
    checks.backend.issues.push('env.example not found');
  }

  if (checks.backend.issues.length === 0) {
    checks.backend.status = '✅';
  }
}

// Check Frontend
function checkFrontend() {
  const frontendPath = path.join(__dirname, 'Frontend');
  
  if (!fs.existsSync(frontendPath)) {
    checks.frontend.issues.push('Frontend directory not found');
    return;
  }

  // Check package.json
  const packageJsonPath = path.join(frontendPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    checks.frontend.issues.push('package.json not found');
    return;
  }

  // Check src directory
  const srcPath = path.join(frontendPath, 'src');
  if (!fs.existsSync(srcPath)) {
    checks.frontend.issues.push('src directory not found');
    return;
  }

  // Check main files
  const mainFiles = ['main.ts', 'index.html'];
  mainFiles.forEach(file => {
    if (!fs.existsSync(path.join(srcPath, file))) {
      checks.frontend.issues.push(`${file} not found`);
    }
  });

  // Check app directory
  const appPath = path.join(srcPath, 'app');
  if (!fs.existsSync(appPath)) {
    checks.frontend.issues.push('app directory not found');
  }

  if (checks.frontend.issues.length === 0) {
    checks.frontend.status = '✅';
  }
}

// Check Mock AI Service
function checkMockAi() {
  const mockAiPath = path.join(__dirname, 'mock-ai-service');
  
  if (!fs.existsSync(mockAiPath)) {
    checks.mockAi.issues.push('mock-ai-service directory not found');
    return;
  }

  // Check package.json
  const packageJsonPath = path.join(mockAiPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    checks.mockAi.issues.push('package.json not found');
    return;
  }

  // Check server.js
  const serverPath = path.join(mockAiPath, 'server.js');
  if (!fs.existsSync(serverPath)) {
    checks.mockAi.issues.push('server.js not found');
  }

  // Check README
  const readmePath = path.join(mockAiPath, 'README.md');
  if (!fs.existsSync(readmePath)) {
    checks.mockAi.issues.push('README.md not found');
  }

  if (checks.mockAi.issues.length === 0) {
    checks.mockAi.status = '✅';
  }
}

// Check Database Schema
function checkDatabase() {
  const schemaPath = path.join(__dirname, 'Backend', 'prisma', 'schema.prisma');
  
  if (!fs.existsSync(schemaPath)) {
    checks.database.issues.push('schema.prisma not found');
    return;
  }

  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  
  // Check for required models
  const requiredModels = ['Video', 'Annotation', 'RapportAnalyse', 'User', 'Admin'];
  requiredModels.forEach(model => {
    if (!schemaContent.includes(`model ${model}`)) {
      checks.database.issues.push(`Model ${model} not found in schema`);
    }
  });

  // Check for MongoDB configuration
  if (!schemaContent.includes('provider = "mongodb"')) {
    checks.database.issues.push('MongoDB provider not configured');
  }

  if (checks.database.issues.length === 0) {
    checks.database.status = '✅';
  }
}

// Check Documentation
function checkDocumentation() {
  const docs = [
    'README.md',
    'SETUP.md',
    'IMPROVEMENTS_SUMMARY.md',
    'Backend/README.md',
    'Backend/SCRIPTS.md',
    'Frontend/README.md',
    'mock-ai-service/README.md',
    'mock-ai-service/integration-guide.md'
  ];

  docs.forEach(doc => {
    if (!fs.existsSync(path.join(__dirname, doc))) {
      checks.documentation.issues.push(`${doc} not found`);
    }
  });

  if (checks.documentation.issues.length === 0) {
    checks.documentation.status = '✅';
  }
}

// Run all checks
checkBackend();
checkFrontend();
checkMockAi();
checkDatabase();
checkDocumentation();

// Display results
console.log('📋 Health Check Results:\n');

Object.values(checks).forEach(check => {
  console.log(`${check.status} ${check.name}`);
  if (check.issues.length > 0) {
    check.issues.forEach(issue => {
      console.log(`   ⚠️  ${issue}`);
    });
  }
  console.log('');
});

// Summary
const totalChecks = Object.keys(checks).length;
const passedChecks = Object.values(checks).filter(check => check.status === '✅').length;

console.log(`📊 Summary: ${passedChecks}/${totalChecks} components are healthy`);

if (passedChecks === totalChecks) {
  console.log('🎉 All components are properly configured!');
  console.log('\n🚀 Next steps:');
  console.log('1. Set up environment variables (Backend/env.example)');
  console.log('2. Install dependencies (npm install in Backend/ and Frontend/)');
  console.log('3. Start MongoDB');
  console.log('4. Run: cd Backend && npx prisma generate && npx prisma db push');
  console.log('5. Start services: Backend (npm run start:dev), Frontend (npm start), Mock AI (npm start)');
} else {
  console.log('\n🔧 Issues found. Please fix the above issues before proceeding.');
}

console.log('\n📖 For detailed setup instructions, see SETUP.md'); 