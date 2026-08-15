import { describe, it, expect } from 'vitest';
import { formatReport } from '../src/reporter.mjs';

describe('reporter.mjs formatting', () => {
  it('prints aligned columns with cooldown padded', () => {
    const out = formatReport({
      cooldownDays: 5,
      colour: false,
      packagesToUpdate: [
        {
          name: 'lodash',
          currentVersion: '^4.0.0',
          targetVersion: '^4.17.21',
          major: false,
          majorAllowed: false,
          eligible: true,
          withinCooldown: false,
          cooldownDays: 5,
          fallbackUsed: false
        }
      ],
      majorUpdates: []
    });

    const lines = out.split('\n');
    const row = lines.find(l => l.startsWith('lodash'));

    expect(row.slice(0, 25).trim()).toBe('lodash');
    expect(row.slice(25, 40).trim()).toBe('^4.0.0');
    expect(row.slice(40, 55).trim()).toBe('^4.17.21');
    expect(row.slice(55, 67).trim()).toBe('5d');

    // Correct expectation
    expect(row).toContain('Minor update');
  });
});
