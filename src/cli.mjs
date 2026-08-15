import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { loadConfig, getNpmMinimumReleaseAge } from './config.mjs';
import { runCheck } from './runner.mjs';
import { printReport } from './reporter.mjs';

export async function main(args = hideBin(process.argv)) {
  try {
    const argv = yargs(args)
      .option('config', { type: 'string' })
      .option('update-package-json', { type: 'boolean' })
      .option('install-updates', { type: 'boolean' })
      .option('cooldown-days', { type: 'number' })
      .option('ignore-pattern', { type: 'array' })
      .option('allow-major', { type: 'array' })
      .option('disallow-major', { type: 'array' })
      .option('no-colour', {
        type: 'boolean',
        describe: 'Disable colour output in the report'
      })
      .help()
      .parse();

    const baseConfig = loadConfig(argv.config);
    const npmCooldown = getNpmMinimumReleaseAge();

    const effectiveConfig = {
      ...baseConfig,
      cooldownDaysOverride:
        argv.cooldownDays ?? baseConfig.cooldownDaysOverride ?? npmCooldown,
      updatePackageJson: argv.updatePackageJson ?? baseConfig.updatePackageJson,
      installUpdates: argv.installUpdates ?? baseConfig.installUpdates,
      ignoreCooldownPatterns: argv.ignorePattern
        ? argv.ignorePattern.map((p) => new RegExp(p))
        : baseConfig.ignoreCooldownPatterns,
      majorRules: {
        ...baseConfig.majorRules,
        allow: argv.allowMajor ?? baseConfig.majorRules.allow ?? [],
        disallow: argv.disallowMajor ?? baseConfig.majorRules.disallow ?? []
      }
    };

    const result = await runCheck(effectiveConfig);
    printReport(result);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}
