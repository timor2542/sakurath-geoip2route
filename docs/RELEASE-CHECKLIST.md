# Release and contest checklist — v1.8.0

Use this checklist against the actual release build and the intended public deployment. Automated checks are evidence of the code; they do not replace live verification.

## Automated checks already included

- [x] Structural smoke check.
- [x] 45 focused tests for ranking, CSV import, IPv6 identity, current-IP validation, progress reporting, accessibility wiring, export safety, caching, and rate-limit declarations.
- [x] Production Vite build.
- [x] Netlify function limits declared for both quota-consuming endpoints.
- [x] GitHub Actions workflow for checks and build on pushes and pull requests.
- [x] ZIP content and secret-pattern scan for the release candidate.

Run locally with:

```bash
npm run check
npm run build
```

## Required before public release

- [ ] Exercise a real lookup on the intended host and confirm the fields returned by the current IP2Location plan.
- [ ] Confirm the two Netlify rate-limit rules in the first deployment log and verify the expected `429` response when a limit is exceeded.
- [ ] Test authorized HTTPS probes from at least two networks. Inspect successful and failed samples instead of treating every failure as “offline”.
- [ ] Check desktop and mobile layouts in both languages and both themes, including enlarged text and keyboard navigation.
- [ ] Import a valid and invalid CSV; verify detected column roles, row errors, duplicate merging, Probe URL matching, and exports.
- [ ] Select A/B points, clear the selection, remove one point, use Delete all, and confirm that destructive actions ask before deleting.
- [ ] Confirm the Activity Console opens, collapses, follows the selected language, wraps long IPv6 values, and redacts secret-like values.
- [ ] Publish the intended repository with the MIT license and predecessor attribution. Exclude local settings, dependencies, and secrets.
- [ ] Verify the public application from a signed-out browser and capture current screenshots only after the deployed UI is confirmed.
- [ ] Review the official contest terms, deadline, and required submission fields.

## Submission quality bar

Describe the project as an explainable comparison aid. Show the separate geographic and browser-measured evidence, state the known limitations, and make only claims that the current release demonstrates. Do not describe the score as a percentage, traceroute result, uptime guarantee, or remote-origin latency measurement.
