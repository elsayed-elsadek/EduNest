import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import process from 'node:process';
import { afterEach, describe, expect, it } from 'vitest';

const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function runProductionBuild(apiBaseUrl?: string) {
  const projectRoot = resolve('.');
  const envDirectory = mkdtempSync(resolve(tmpdir(), 'edunest-env-build-'));
  temporaryDirectories.push(envDirectory);

  const env = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !key.startsWith('VITE_')),
  );
  if (apiBaseUrl !== undefined) env.VITE_API_BASE_URL = apiBaseUrl;

  return spawnSync(
    process.execPath,
    [
      resolve(projectRoot, 'node_modules/vite/bin/vite.js'),
      'build',
      projectRoot,
      '--config',
      resolve(projectRoot, 'vite.config.ts'),
      '--mode',
      'production',
    ],
    {
      cwd: envDirectory,
      env,
      encoding: 'utf8',
      timeout: 60_000,
    },
  );
}

describe('production build environment validation', () => {
  it.each([
    ['missing', undefined],
    ['malformed', 'not-an-absolute-url'],
  ])('fails the actual production build for a %s API URL', (_case, apiBaseUrl) => {
    const result = runProductionBuild(apiBaseUrl);
    const output = `${result.stdout}\n${result.stderr}`;

    expect(result.error).toBeUndefined();
    expect(result.status).not.toBe(0);
    expect(output).toContain('VITE_API_BASE_URL');

    if (apiBaseUrl) expect(output).not.toContain(apiBaseUrl);
  }, 70_000);
});
