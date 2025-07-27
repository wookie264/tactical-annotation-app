#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Tactical Annotation App - Quick Start\n');

function runCommand(command, cwd = process.cwd()) {
  try {
    console.log(`📝 Running: ${command}`);
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`❌ Failed: ${command}`);
    return false;
  }
}

function checkPrerequisites() {
  console.log('🔍 Checking prerequisites...\n');
  
  // Check Node.js
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Node.js: ${nodeVersion}`);
  } catch (error) {
    console.error('❌ Node.js not found. Please install Node.js v18 or higher.');
    return false;
  }

  // Check npm
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`✅ npm: ${npmVersion}`);
  } catch (error) {
    console.error('❌ npm not found. Please install npm.');
    return false;
  }

  // Check if directories exist
  const requiredDirs = ['Backend', 'Frontend', 'mock-ai-service'];
  requiredDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`✅ ${dir} directory found`);
    } else {
      console.error(`❌ ${dir} directory not found`);
      return false;
    }
  });

  console.log('');
  return true;
}

function setupBackend() {
  console.log('🔧 Setting up Backend...\n');
  
  const backendPath = path.join(process.cwd(), 'Backend');
  
  // Install dependencies
  if (!runCommand('npm install', backendPath)) {
    return false;
  }

  // Create .env file if it doesn't exist
  const envPath = path.join(backendPath, '.env');
  const envExamplePath = path.join(backendPath, 'env.example');
  
  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    console.log('📝 Creating .env file from template...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created. Please edit it with your configuration.');
  }

  // Generate Prisma client
  if (!runCommand('npx prisma generate', backendPath)) {
    return false;
  }

  console.log('✅ Backend setup completed\n');
  return true;
}

function setupFrontend() {
  console.log('🔧 Setting up Frontend...\n');
  
  const frontendPath = path.join(process.cwd(), 'Frontend');
  
  // Install dependencies
  if (!runCommand('npm install', frontendPath)) {
    return false;
  }

  console.log('✅ Frontend setup completed\n');
  return true;
}

function setupMockAi() {
  console.log('🔧 Setting up Mock AI Service...\n');
  
  const mockAiPath = path.join(process.cwd(), 'mock-ai-service');
  
  // Install dependencies
  if (!runCommand('npm install', mockAiPath)) {
    return false;
  }

  console.log('✅ Mock AI Service setup completed\n');
  return true;
}

function createTestUser() {
  console.log('👤 Creating test user...\n');
  
  const backendPath = path.join(process.cwd(), 'Backend');
  
  // Check if create-user.ts exists
  const createUserPath = path.join(backendPath, 'create-user.ts');
  if (!fs.existsSync(createUserPath)) {
    console.log('⚠️  create-user.ts not found, skipping user creation');
    return true;
  }

  // Create test user
  if (runCommand('npx ts-node create-user.ts admin admin123', backendPath)) {
    console.log('✅ Test user created: admin/admin123\n');
    return true;
  } else {
    console.log('⚠️  Failed to create test user. You can create it manually later.\n');
    return true;
  }
}

function displayNextSteps() {
  console.log('🎯 Next Steps:\n');
  console.log('1. 📝 Edit Backend/.env with your configuration:');
  console.log('   - DATABASE_URL (MongoDB connection)');
  console.log('   - JWT_SECRET (for authentication)');
  console.log('   - EMAIL_USER/EMAIL_PASSWORD (for password reset)');
  console.log('');
  console.log('2. 🗄️  Start MongoDB:');
  console.log('   - Local: mongod');
  console.log('   - Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest');
  console.log('');
  console.log('3. 🚀 Start the services:');
  console.log('   - Backend: cd Backend && npm run start:dev');
  console.log('   - Frontend: cd Frontend && npm start');
  console.log('   - Mock AI: cd mock-ai-service && npm start');
  console.log('');
  console.log('4. 🌐 Access the application:');
  console.log('   - Frontend: http://localhost:4200');
  console.log('   - Backend API: http://localhost:3000');
  console.log('   - Mock AI: http://localhost:3001');
  console.log('');
  console.log('5. 👤 Login with: admin/admin123');
  console.log('');
  console.log('📖 For detailed instructions, see SETUP.md');
}

// Main execution
async function main() {
  console.log('Welcome to the Tactical Annotation App Quick Start!\n');
  
  // Check prerequisites
  if (!checkPrerequisites()) {
    console.error('❌ Prerequisites check failed. Please fix the issues above.');
    process.exit(1);
  }

  // Setup components
  const setups = [
    { name: 'Backend', fn: setupBackend },
    { name: 'Frontend', fn: setupFrontend },
    { name: 'Mock AI Service', fn: setupMockAi }
  ];

  for (const setup of setups) {
    console.log(`\n🔄 Setting up ${setup.name}...`);
    if (!setup.fn()) {
      console.error(`❌ ${setup.name} setup failed.`);
      process.exit(1);
    }
  }

  // Create test user
  createTestUser();

  // Display next steps
  displayNextSteps();

  console.log('\n🎉 Quick start completed successfully!');
}

// Run the script
main().catch(error => {
  console.error('❌ Quick start failed:', error.message);
  process.exit(1);
}); 