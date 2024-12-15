#!/usr/bin/env node

import { spawn } from 'child_process';
import nodemon from 'nodemon';
import { exec } from 'child_process';

let currentInspector = null;
let isShuttingDown = false;

// Function to kill all node processes running the inspector
function killAllInspectors() {
  return new Promise((resolve) => {
    if (process.platform === 'win32') {
      exec('taskkill /F /IM node.exe /FI "WINDOWTITLE eq @modelcontextprotocol/inspector*"');
    } else {
      exec('pkill -f "@modelcontextprotocol/inspector"');
    }
    resolve();
  });
}

// Function to run the inspector
function startInspector() {
  if (isShuttingDown) return null;
  
  const inspector = spawn('npm', ['run', 'inspect'], {
    stdio: 'inherit',
    shell: true
  });

  inspector.on('error', (err) => {
    console.error('Inspector failed to start:', err);
  });

  return inspector;
}

// Cleanup function
async function cleanup() {
  isShuttingDown = true;
  
  if (currentInspector) {
    currentInspector.kill('SIGTERM');
    currentInspector = null;
  }
  
  await killAllInspectors();
  nodemon.emit('quit');
}

// Set up nodemon to watch the src directory
nodemon({
  watch: ['src'],
  ext: 'ts',
  exec: 'npm run build'
});

// Handle nodemon events
nodemon
  .on('start', () => {
    console.log('Starting build...');
  })
  .on('restart', async () => {
    console.log('Files changed, rebuilding...');
    if (currentInspector) {
      currentInspector.kill('SIGTERM');
      await killAllInspectors();
    }
  })
  .on('quit', () => {
    console.log('Nodemon stopped');
    cleanup().then(() => process.exit(0));
  })
  .on('error', (err) => {
    console.error('Nodemon error:', err);
  })
  .on('crash', () => {
    console.error('Application crashed');
    cleanup();
  })
  .on('exit', () => {
    if (!isShuttingDown) {
      if (currentInspector) {
        currentInspector.kill('SIGTERM');
      }
      currentInspector = startInspector();
    }
  });

// Handle process termination
process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);
process.on('SIGHUP', cleanup);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  cleanup().then(() => process.exit(1));
});
