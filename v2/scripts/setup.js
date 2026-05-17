const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');

function checkDeps() {
  const workspaces = ['client', 'server'];
  for (const ws of workspaces) {
    const nmPath = path.join(rootDir, ws, 'node_modules');
    if (!fs.existsSync(nmPath) || fs.readdirSync(nmPath).length === 0) {
      console.log(`Instalando dependencias de ${ws}...`);
      execSync('npm install', { cwd: path.join(rootDir, ws), stdio: 'inherit' });
    }
  }
}

function checkEnv() {
  const envPath = path.join(rootDir, 'server', '.env');
  const examplePath = path.join(rootDir, 'server', '.env.example');
  if (!fs.existsSync(envPath) && fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, envPath);
    console.log('Creado server/.env desde .env.example');
  }
}

checkEnv();
checkDeps();
