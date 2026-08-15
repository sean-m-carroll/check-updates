import { describe, it, expect } from 'vitest';
import { formatReport } from '../src/reporter.mjs';

describe('reporter coloured table', () => {
  it('matches snapshot with smarter reporting', () => {
    const result = {
      cooldownDays: 10,
      colour: false,
      packagesToUpdate: [
        {
          name: 'lodash',
          currentVersion: '^4.0.0',
          targetVersion: '^4.17.21',
          major: false,
          majorAllowed: true,
          eligible: true,
          withinCooldown: false,
          cooldownDays: 12
        }
      ],
      majorUpdates: []
    };

    expect(formatReport(result)).toMatchSnapshot();
  });
});
