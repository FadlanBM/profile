# CI and Security Guardian

Pushes and pull requests targeting `dev` or `main` run Code Quality
(ESLint, generated Next.js route types, TypeScript, Node tests, production build)
and Security Guardian (npm audit and CodeQL for TypeScript/JavaScript and Actions).
Security Guardian also supports manual runs and runs every Monday at 02:00 UTC.

Actions use pinned commit SHAs, read-only default permissions, timeouts, and
concurrency cancellation. CI never needs production credentials.

Run locally with Node.js 22:

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run security:audit
```

The audit fails on high or critical findings, including development dependencies.
Do not bypass failures with `continue-on-error` or downgrade Next.js to satisfy
an audit suggestion. Review upstream fixes before updating the lockfile.
Existing ESLint warnings remain visible; lint errors fail CI.

Dependabot checks npm packages and pinned Actions weekly, targeting `dev`.
GitHub loads this configuration and scheduled workflows from the default branch;
merge the setup pull request into `main` to activate those features.
CodeQL reports findings in the repository Security tab; a successful analysis
means scanning completed, not that the application has no vulnerabilities.

At setup, compatible dependency updates removed the critical Next.js findings.
The remaining high audit findings come from `braces` through the Next.js ESLint
toolchain; the suggested forced downgrade is incompatible with this project.
Security Guardian intentionally reports a failed dependency audit until upstream
provides a compatible fix. Two moderate findings remain in `uuid`/`gaxios`.
