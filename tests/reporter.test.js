import { describe, it, expect } from 'vitest';
import { formatReport } from '../src/reporter.mjs';

describe('reporter.mjs', () => {
  it('snapshot of formatted report', () => {
    const result = {
      cooldownDays: 7,
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
      majorUpdates: [
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
      ]
    };

    expect(formatReport(result)).toMatchSnapshot();
  });
});
