const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '../src/app/api');
const backupApiDir = path.join(__dirname, '../src/app/_api');

function run(command) {
  console.log(`> ${command}`);
  execSync(command, { stdio: 'inherit' });
}

try {
  // 1. 임시로 API 디렉토리 숨기기 (static export에서 제외)
  if (fs.existsSync(apiDir)) {
    console.log('Temporarily moving /api to /_api for Capacitor static export...');
    fs.renameSync(apiDir, backupApiDir);
  }

  // 2. Next.js 빌드
  run('cross-env CAPACITOR_BUILD=true next build');

  // 3. Capacitor 동기화
  run('npx cap sync android');

} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} finally {
  // 4. API 디렉토리 원상 복구
  if (fs.existsSync(backupApiDir)) {
    console.log('Restoring /api directory...');
    fs.renameSync(backupApiDir, apiDir);
  }
}
