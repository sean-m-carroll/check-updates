# Check Updates

Utilising [npm-check-updates](https://github.com/raineorshine/npm-check-updates) this package allows you to update your package.json dependencies to the latest minor/patch version.

It uses [npm-check-updates](https://github.com/raineorshine/npm-check-updates) to do most of the heavy lifting but allows for some extra build in options:
- It respects the npm cooldown option from the system (`min-release-age`) but will also allow this to be overriddden - using regex to either allow whitelisting of a suite of packages or specific packages. This means you can ignore the cooldown period for your own organisations packages with little to no effort.
- Allows for control of automically updating the package.json with the updated packages.
- Allows for control of automically installing the updated packages (whilst applying the appropriate cooldown rule).
- Reports on which packages have updates available
- Reports on packages which have a newer major version (not installed by default)
- Allows for specifying via regex which, if any packages, are allowed to update when major releases are available.

## Requirements

- **Node.js:** `^22.22.2 || ^24.15.0 || >=26.0.0`
- **npm:** `>=10.0.0`

## Installation

Install globally to use `@4t2/check-updates`:

```sh
npm install -g @4t2/check-updates
```

## Configuration

