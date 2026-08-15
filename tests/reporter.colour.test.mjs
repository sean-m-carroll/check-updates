import { describe, it, expect } from 'vitest';
import { formatReport } from '../src/reporter.mjs';

describe('reporter coloured table', () => {
  it('matches snapshot without colour and with cooldown column', () => {
    const result = {
      cooldownDays: 10,
      colour: false,
      packagesToUpdate: [
        {
          name: 'lodash',
          currentVersion: '^4.0.0',
          targetVersion: '^5.0.0',
          depType: 'dependency',
          major: true,
          majorAllowed: true,
          eligible: true,
          cooldownDays: 12
        }
      ],
      majorUpdates: []
    };

    expect(formatReport(result)).toMatchSnapshot();
  });
});
