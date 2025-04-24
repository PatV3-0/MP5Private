import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const cliPath = '../src/cli.ts';
const pidFilePath = path.resolve(__dirname, '../../daemon/src/daemon.lock');

console.log('CLI Path:', cliPath);

describe('CLI Commands', () => {
  beforeEach(() => {
    // Ensure the directory for the PID file exists
    const pidDir = path.dirname(pidFilePath);
    if (!fs.existsSync(pidDir)) {
      fs.mkdirSync(pidDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up the PID file after each test
    if (fs.existsSync(pidFilePath)) {
      fs.unlinkSync(pidFilePath);
    }
  });

  test('Start command starts the daemon', () => {
    const result = spawnSync('npx', ['tsx', cliPath, 'start'], { encoding: 'utf-8', shell: true });
    expect(result);
    console.log('Start command output:', result.stdout); // Log the output for debugging
    console.log('Start command error:', result.stderr); // Log any errors for debugging
    expect(result.stdout).toContain('Daemon started with PID:');
    expect(result.status).toBe(0);
    expect(fs.existsSync(pidFilePath)).toBe(true); // Ensure the PID file is created
  });

  test('Status command shows daemon is running', () => {
    // Simulate the daemon being started by creating the PID file
    fs.writeFileSync(pidFilePath, '12345');

    const result = spawnSync('npx', ['tsx', cliPath, 'status'], { encoding: 'utf-8' });
    expect(result.stdout).toContain('daemon is running (PID: 12345)');
    expect(result.status).toBe(0);
  });

  test('Stop command stops the daemon', () => {
    // Simulate the daemon being started by creating the PID file
    fs.writeFileSync(pidFilePath, '12345');

    const result = spawnSync('npx', ['tsx', cliPath, 'stop'], { encoding: 'utf-8' });
    expect(result.stdout).toContain('Daemon stoped successfully.');
    expect(result.status).toBe(0);
    expect(fs.existsSync(pidFilePath)).toBe(false); // Ensure the PID file is deleted
  });
});