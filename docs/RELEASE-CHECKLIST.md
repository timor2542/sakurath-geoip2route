# Release and submission checklist — v1.8.0

The ZIP is a release candidate, not a promise of an award. Test the actual deployed URL and current API plan before submitting.

## Included automated checks

- [x] Application structural smoke check.
- [x] Forty-five focused tests, including disabled-state CSS, full distance labels, ranking evidence separation, mobile demo handoff, dialog accessibility, mock HTTP failures/timeouts, CSV parsing, console secret filtering, Netlify rate-limit declarations, cache behavior and export safety.
- [x] Production frontend compilation.
- [x] Netlify code-based limits are declared for both quota-consuming functions.
- [x] GitHub Actions workflow runs checks and build on pushes and pull requests.
- [x] ZIP content and secret-pattern scan completed for the release candidate.

These checks use mocks for external API/HTTP responses and do not certify live service availability.

## Complete before public release

- [ ] Test a real IP2Location key locally and on the intended host; verify plan-dependent fields and quota errors.
- [ ] Confirm both code-based rate-limit rules appear in the first Netlify deploy log and return `429` when exceeded.
- [ ] Test authorized HTTPS probes from two networks and inspect successful/failed samples.
- [ ] Check desktop/mobile, EN/TH, light/dark and enlarged text on your target browsers.
- [ ] Import CSV, select A/B, delete a point during refresh, reload, and verify exported JSON/CSV.
- [ ] Confirm the Activity Console opens/collapses, follows EN/TH, wraps long IPv6 values and never shows the API key or probe URL.
- [ ] Create the new repository, retain MIT license and predecessor attribution, and exclude secrets and node_modules.
- [ ] Publish a live demo and verify it from an unsigned-in browser.
- [ ] Capture actual screenshots and a short demo recording with simulation labels visible.
- [ ] Review current contest terms, submission deadline and entry requirements on the official contest site.
- [ ] Submit only claims demonstrated by this release; do not inflate stars, users, benchmarks or originality.

Run `CHECK-CONTEST-READY.bat` immediately before creating the final ZIP or Git tag. Automated success does not check the live key, deployed URL, screenshots, social engagement or submission form.

## Submission positioning

Explain the extension from IP lookup to a decision aid, show the transparent formulas, and acknowledge limitations. Functionality and reproducibility are within your control; judging and competing entries are not.
