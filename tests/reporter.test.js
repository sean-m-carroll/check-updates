import { describe, it, expect } from 'vitest';
import { formatReport } from '../src/reporter.mjs';

describe('reporter.mjs basic formatting', () => {
  it('prints empty update table', () => {
    const result = {
      cooldownDays: 7,
      colour: false,
      packagesToUpdate: [],
      majorUpdates: []
    };

    const out = formatReport(result);
    expect(out).toContain('No packages eligible for update.');
    expect(out).toContain('Major updates:');
  });
});
