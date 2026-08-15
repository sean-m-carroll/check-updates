import { describe, it, expect, vi, beforeEach } from 'vitest';

// IMPORTANT: mock BEFORE importing cli.mjs
vi.mock('../src/config.mjs', () => {
  return {
    loadConfig: vi.fn(),
    getNpmMinimumReleaseAge: vi.fn()
  };
});

import { loadConfig, getNpmMinimumReleaseAge } from '../src/config.mjs';
import { main } from '../src/cli.mjs';

beforeEach(() => {
  process.env.VITEST = '1'; // ensures main() returns merged config
  vi.clearAllMocks();
});

describe('CLI unit tests', () => {

  it('merges config and CLI flags', async () => {
    loadConfig.mockReturnValue({
      cooldownDaysOverride: 10,
      majorRules: { allow: [], disallow: [] },
      colour: true
    });

    getNpmMinimumReleaseAge.mockReturnValue(7);

    const result = await main([
      '--cooldown-days', '3',
      '--no-colour'
    ]);

    expect(result.cooldownDaysOverride).toBe(3);
    expect(result.colour).toBe(false);
    expect(result.majorRules).toEqual({ allow: [], disallow: [] });
  });

  it('uses config defaults when flags are not provided', async () => {
    loadConfig.mockReturnValue({
      cooldownDaysOverride: 5,
      majorRules: { allow: ['^react'], disallow: [] },
      colour: true
    });

    getNpmMinimumReleaseAge.mockReturnValue(7);

    const result = await main([]);

    expect(result.cooldownDaysOverride).toBe(5);
    expect(result.colour).toBe(true);
    expect(result.majorRules.allow).toContain('^react');
  });

  it('parses boolean flags correctly', async () => {
    loadConfig.mockReturnValue({
      cooldownDaysOverride: 5,
      majorRules: { allow: [], disallow: [] },
      colour: true
    });

    getNpmMinimumReleaseAge.mockReturnValue(7);

    const result = await main(['--no-colour']);

    expect(result.colour).toBe(false);
  });

});
