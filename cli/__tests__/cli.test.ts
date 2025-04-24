import { spawnSync } from 'child_process';
import path from 'path';

const cliPath = path.resolve(__dirname, '../src/cli.ts');

console.log('CLI Path:', cliPath);

describe('CLI Commands', () => { 

  test('Start command starts the daemon', async () => {
    const result = spawnSync('npx', ['tsx', cliPath, 'start'], { encoding: 'utf-8', shell: true });
    console.log('Start command output:', result.stdout);
    expect(result.stdout).toContain('Daemon started with PID:');
    expect(result.status).toBe(0);

    // Wait for 2 seconds to ensure the daemon is fully started
    await new Promise((resolve) => setTimeout(resolve, 2000));
  });

  // test('Status command shows daemon is running', async () => {
  //   // Wait for 1 second to ensure the daemon is running
  //   await new Promise((resolve) => setTimeout(resolve, 1000));

  //   const result = spawnSync('npx', ['tsx', cliPath, 'status'], { encoding: 'utf-8' });
  //   console.log('status command output:', result.stdout);
  //   expect(result.stdout).toContain('daemon is running');
  //   expect(result.status).toBe(0);
  // });

  // test('Stop command stops the daemon', async () => {
  //   // Wait for 1 second to ensure the daemon is ready to be stopped
  //   await new Promise((resolve) => setTimeout(resolve, 1000));

  //   const result = spawnSync('npx', ['tsx', cliPath, 'stop'], { encoding: 'utf-8' });
  //   console.log('stop command output:', result.stdout);
  //   expect(result.stdout).toContain('Daemon stopped successfully.');
  //   expect(result.status).toBe(0);
  // });
});