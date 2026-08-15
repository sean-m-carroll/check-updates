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
          majorAllowed: true,
          eligible: true,
          withinCooldown: false,
          cooldownDays: 5,
          fallbackUsed: false
        }
      ],
      majorUpdates: []
    });

    const row = out.split('\n').find(l => l.startsWith('lodash'));

    expect(row.slice(0, 25).trim()).toBe('lodash');
    expect(row.slice(25, 40).trim()).toBe('^4.0.0');
    expect(row.slice(40, 55).trim()).toBe('^4.17.21');
    expect(row.slice(55, 67).trim()).toBe('5d');
    expect(row).toContain('Minor update');
  });

  it('prints fallback update notes', () => {
    const out = formatReport({
      cooldownDays: 10,
      colour: false,
      packagesToUpdate: [
        {
          name: 'vitest',
          currentVersion: '^1.0.0',
          targetVersion: '^4.1.10',
          major: false,
          majorAllowed: false,
          eligible: true,
          withinCooldown: false,
          cooldownDays: 10,
          fallbackUsed: true
        }
      ],
      majorUpdates: []
    });

    const row = out.split('\n').find(l => l.startsWith('vitest'));
    expect(row).toContain('Fallback update');
  });

  it('prints major update allowed', () => {
    const out = formatReport({
      cooldownDays: 7,
      colour: false,
      packagesToUpdate: [
        {
          name: 'eslint',
          currentVersion: '^10.0.0',
          targetVersion: '^11.0.0',
          major: true,
          majorAllowed: true,
          eligible: true,
          withinCooldown: false,
          cooldownDays: 7,
          fallbackUsed: false
        }
      ],
      majorUpdates: [
        {
          name: 'eslint',
          currentVersion: '^10.0.0',
          targetVersion: '^11.0.0',
          major: true,
          majorAllowed: true,
          eligible: true,
          withinCooldown: false,
          cooldownDays: 7,
          fallbackUsed: false
        }
      ]
    });

    const row = out.split('\n').find(l => l.startsWith('eslint'));
    expect(row).toContain('Major update');
    expect(row).not.toContain('Blocked by rule');
  });

  it('prints major update blocked', () => {
    const out = formatReport({
      cooldownDays: 7,
      colour: false,
      packagesToUpdate: [
        {
          name: 'eslint',
          currentVersion: '^10.0.0',
          targetVersion: '^11.0.0',
          major: true,
          majorAllowed: false,
          eligible: false,
          withinCooldown: false,
          cooldownDays: 7,
          fallbackUsed: false
        }
      ],
      majorUpdates: [
        {
          name: 'eslint',
          currentVersion: '^10.0.0',
          targetVersion: '^11.0.0',
          major: true,
          majorAllowed: false,
          eligible: false,
          withinCooldown: false,
          cooldownDays: 7,
          fallbackUsed: false
        }
      ]
    });

    const row = out.split('\n').find(l => l.startsWith('eslint'));
    expect(row).toContain('Major update');
    expect(row).toContain('Blocked by rule');
    expect(row).toContain('Not eligible');
  });

  it('prints patch update', () => {
    const out = formatReport({
      cooldownDays: 5,
      colour: false,
      packagesToUpdate: [
        {
          name: 'react',
          currentVersion: '^18.2.0',
          targetVersion: '^18.2.1',
          major: false,
          majorAllowed: true,
          eligible: true,
          withinCooldown: false,
          cooldownDays: 5,
          fallbackUsed: false
        }
      ],
      majorUpdates: []
    });

    const row = out.split('\n').find(l => l.startsWith('react'));
    expect(row).toContain('Patch update'); // patch is treated as minor in reporter
  });

  it('prints colour-coded versions when colour is enabled', () => {
    const out = formatReport({
      cooldownDays: 5,
      colour: true,
      packagesToUpdate: [
        {
          name: 'lodash',
          currentVersion: '^4.0.0',
          targetVersion: '^4.17.21',
          major: false,
          majorAllowed: true,
          eligible: true,
          withinCooldown: false,
          cooldownDays: 5,
          fallbackUsed: false
        }
      ],
      majorUpdates: []
    });

    const row = out.split('\n').find(l => l.startsWith('lodash'));

    // Use RegExp constructor to avoid Vite import-analysis parser errors
    expect(row).toMatch(new RegExp("\\x1b\\["));
  });

  it('classifies fallback updates correctly', () => {
    const out = formatReport({
      cooldownDays: 5,
      colour: false,
      packagesToUpdate: [
        {
          name: 'pkg',
          currentVersion: '1.0.0',
          targetVersion: '1.2.0',
          major: false,
          majorAllowed: false,
          eligible: true,
          withinCooldown: false,
          cooldownDays: 5,
          fallbackUsed: true
        }
      ],
      majorUpdates: []
    });

    expect(out).toContain('Fallback update');
  });

  it('prints None when no major updates exist', () => {
    const out = formatReport({
      cooldownDays: 5,
      colour: false,
      packagesToUpdate: [],
      majorUpdates: []
    });

    expect(out).toContain('None');
  });

  it('prints ANSI colour codes when colour is enabled', () => {
    const out = formatReport({
      cooldownDays: 5,
      colour: true,
      packagesToUpdate: [
        {
          name: 'pkg',
          currentVersion: '1.0.0',
          targetVersion: '1.1.0',
          major: false,
          majorAllowed: true,
          eligible: true,
          withinCooldown: false,
          cooldownDays: 5,
          fallbackUsed: false
        }
      ],
      majorUpdates: []
    });

    const row = out.split('\n').find(l => l.startsWith('pkg'));
    expect(row).toMatch(new RegExp("\\x1b\\["));
  });
});
