import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock all CLI dependencies
vi.mock('../src/config.mjs', () => ({
  loadConfig: vi.fn(),
  getNpmMinimumReleaseAge: vi.fn()
}));

vi.mock('../src/runner.mjs', () => ({
  runCheck: vi.fn()
}));

vi.mock('../src/reporter.mjs', () => ({
  printReport: vi.fn()
}));

// Import CLI AFTER mocks
import * as cli from '../src/cli.mjs';
import { loadConfig, getNpmMinimumReleaseAge } from '../src/config.mjs';
import { runCheck } from '../src/runner.mjs';
import { printReport } from '../src/reporter.mjs';

describe('CLI unit tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('merges config file and CLI flags correctly', async () => {
    loadConfig.mockReturnValue({
      cooldownDaysOverride: null,
      ignoreCooldownPatterns: [],
      updatePackageJson: false,
      installUpdates: false,
      majorRules: { allow: [], disallow: [] }
    });

    getNpmMinimumReleaseAge.mockReturnValue(7);

    runCheck.mockResolvedValue({ result: true });

    await cli.main([
      '--config', 'myconfig.json',
      '--cooldown-days', '3',
      '--update-package-json',
      '--ignore-pattern', '^eslint',
      '--allow-major', 'react'
    ]);

    expect(loadConfig).toHaveBeenCalledWith('myconfig.json');

    expect(runCheck).toHaveBeenCalledWith({
      cooldownDaysOverride: 3,
      ignoreCooldownPatterns: [new RegExp('^eslint')],
      updatePackageJson: true,
      installUpdates: false,
      majorRules: {
        allow: ['react'],
        disallow: []
      }
    });

    expect(printReport).toHaveBeenCalledWith({ result: true });
  });

  it('uses npm minimum-release-age when no override provided', async () => {
    loadConfig.mockReturnValue({
      cooldownDaysOverride: null,
      ignoreCooldownPatterns: [],
      updatePackageJson: false,
      installUpdates: false,
      majorRules: {}
    });

    getNpmMinimumReleaseAge.mockReturnValue(12);

    runCheck.mockResolvedValue({ ok: true });

    await cli.main([]);

    expect(runCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        cooldownDaysOverride: 12
      })
    );
  });

  it('supports disallow-major flag', async () => {
    loadConfig.mockReturnValue({
      cooldownDaysOverride: 5,
      ignoreCooldownPatterns: [],
      updatePackageJson: false,
      installUpdates: false,
      majorRules: { allow: [], disallow: [] }
    });

    getNpmMinimumReleaseAge.mockReturnValue(7);

    runCheck.mockResolvedValue({ ok: true });

    await cli.main([
      '--disallow-major', 'lodash'
    ]);

    expect(runCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        majorRules: {
          allow: [],
          disallow: ['lodash']
        }
      })
    );
  });

  it('handles errors gracefully', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});

    loadConfig.mockImplementation(() => { throw new Error('boom'); });

    await cli.main([]);

    expect(spy).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(1);

    spy.mockRestore();
    exitSpy.mockRestore();
  });
});
