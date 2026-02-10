#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log(`
🎯 QNow Backend Setup Script
=============================

This script will help you set up the QNow backend system.
`);

const questions = [
  {
    name: 'port',
    question: 'Enter the port number for the server (default: 5000): ',
    default: '5000'
  },
  {
    name: 'frontendUrl',
    question: 'Enter your frontend URL (default: http://localhost:3000): ',
    default: 'http://localhost:3000'
  },
  {
    name: 'jwtSecret',
    question: 'Enter a JWT secret key (or press enter to generate one): ',
    default: require('crypto').randomBytes(32).toString('hex')
  }
];

const answers = {};

const askQuestion = (index) => {
  if (index >= questions.length) {
    rl.close();
    createEnvFile();
    return;
  }

  const q = questions[index];
  rl.question(q.question, (answer) => {
    answers[q.name] = answer || q.default;
    askQuestion(index + 1);
  });
};

const createEnvFile = () => {
  const envContent = `
# Server Configuration
PORT=${answers.port}
NODE_ENV=development
FRONTEND_URL=${answers.frontendUrl}

# JWT Configuration
JWT_SECRET=${answers.jwtSecret}
JWT_EXPIRE=7d

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin SDK (for service account)
FIREBASE_SERVICE_ACCOUNT_KEY=./.firebase/serviceAccountKey.json

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password

# SMS Configuration (Twilio - optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
`;

  fs.writeFileSync('.env', envContent);
  
  console.log(`
✅ .env file created successfully!

📋 Next steps:
1. Update the Firebase configuration in the .env file
2. Place your Firebase service account key in .firebase/serviceAccountKey.json
3. Run 'npm install' to install dependencies
4. Run 'npm run dev' to start the development server

🔥 Important: Keep your JWT_SECRET and Firebase keys secure!
`);

  // Ask if user wants to install dependencies
  rl.question('\nDo you want to install dependencies now? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      console.log('\nInstalling dependencies...');
      exec('npm install', (error, stdout, stderr) => {
        if (error) {
          console.error('Error installing dependencies:', error);
        } else {
          console.log('Dependencies installed successfully!');
        }
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
};

// Create necessary directories
const createDirectories = () => {
  const dirs = ['.firebase', 'logs'];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  console.log('📁 Created necessary directories');
  askQuestion(0);
};

createDirectories();