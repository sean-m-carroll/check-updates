import { describe, it, expect } from 'vitest';
import { formatReport } from '../src/reporter.mjs';

describe('reporter coloured table', () => {
  it('matches snapshot without colour', () => {
    const result = {
      cooldownDays: 10,
      colour: false,
      packagesToUpdate: [
        {
          name: 'lodash',
          currentVersion: '^4.0.0',
          targetVersion: '^5.0.0',
          depType: 'dependency',
          withinCooldown: false,
          ignoreCooldown: false,
          major: true,
          majorAllowed: true,
          eligible: true
        }
      ],
      majorUpdates: []
    };

    expect(formatReport(result)).toMatchSnapshot();
  });
});
