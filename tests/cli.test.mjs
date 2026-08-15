import { describe, it, expect, vi, beforeEach } from 'vitest';

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

import * as cli from '../src/cli.mjs';
import { loadConfig, getNpmMinimumReleaseAge } from '../src/config.mjs';
import { runCheck } from '../src/runner.mjs';
import { printReport } from '../src/reporter.mjs';

describe('CLI unit tests', () => {
  beforeEach(() => vi.clearAllMocks());

  it('merges config and CLI flags', async () => {
    loadConfig.mockReturnValue({
      cooldownDaysOverride: null,
      ignoreCooldownPatterns: [],
      updatePackageJson: false,
      installUpdates: false,
      majorRules: { allow: [], disallow: [] },
      colour: true
    });

    getNpmMinimumReleaseAge.mockReturnValue(7);
    runCheck.mockResolvedValue({ result: true });

    await cli.main([
      '--config', 'myconfig.json',
      '--cooldown-days', '3',
      '--update-package-json',
      '--ignore-pattern', '^eslint',
      '--allow-major', 'react',
      '--no-colour'
    ]);

    expect(loadConfig).toHaveBeenCalledWith('myconfig.json');
    expect(runCheck).toHaveBeenCalled();
    expect(printReport).toHaveBeenCalled();
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
