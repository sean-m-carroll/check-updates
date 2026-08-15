import { describe, it, expect } from 'vitest';
import { formatReport } from '../src/reporter.mjs';

describe('reporter.mjs formatting', () => {
  it('includes cooldown column in header', () => {
    const result = {
      cooldownDays: 7,
      colour: false,
      packagesToUpdate: [],
      majorUpdates: []
    };

    const out = formatReport(result);

    // Header should contain the new column
    expect(out).toContain('Cooldown');
    expect(out).toMatch(/Package\s+Installed\s+Available\s+Cooldown\s+Notes/);
  });

  it('prints cooldown days for each package', () => {
    const result = {
      cooldownDays: 7,
      colour: false,
      packagesToUpdate: [
        {
          name: 'react',
          currentVersion: '^18.0.0',
          targetVersion: '^19.0.0',
          major: true,
          majorAllowed: false,
          eligible: false,
          cooldownDays: 5
        }
      ],
      majorUpdates: []
    };

    const out = formatReport(result);

    // Cooldown should appear as "5d"
    expect(out).toContain('5d');

    // Row should contain the cooldown column in the correct position
    expect(out).toMatch(/react\s+.*\s+5d\s+/);
  });

  it('prints multiple packages with correct cooldown formatting', () => {
    const result = {
      cooldownDays: 10,
      colour: false,
      packagesToUpdate: [
        {
          name: 'lodash',
          currentVersion: '^4.17.0',
          targetVersion: '^5.0.0',
          major: true,
          majorAllowed: true,
          eligible: true,
          cooldownDays: 12
        },
        {
          name: 'eslint',
          currentVersion: '^8.0.0',
          targetVersion: '^8.56.0',
          major: false,
          majorAllowed: false,
          eligible: true,
          cooldownDays: 2
        }
      ],
      majorUpdates: []
    };

    const out = formatReport(result);

    expect(out).toContain('12d');
    expect(out).toContain('2d');

    expect(out).toMatch(/lodash\s+.*12d/);
    expect(out).toMatch(/eslint\s+.*2d/);
  });
});
