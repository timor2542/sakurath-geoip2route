# Release and contest checklist — v1.8.0

Use this checklist with the final build and public website. Automated tests check the code, but they do not replace tests on the live website.

## Automated checks already included

- [x] Structural smoke check.
- [x] 45 tests for ranking, CSV import, IPv6 matching, current-IP checks, progress messages, accessibility, safe exports, caching, and rate limits.
- [x] Production Vite build.
- [x] Netlify limits set for both API endpoints that use the quota.
- [x] GitHub Actions checks and builds each push and pull request.
- [x] ZIP file and secret scan for the release version.

Run locally with:

```bash
npm run check
npm run build
```

## Required before public release

- [ ] Run a real lookup on the public website. Check that your IP2Location plan returns the fields used by the app.
- [ ] Check both Netlify rate limits in the first deployment log. Confirm that the platform returns `429` after a user reaches a limit.
- [ ] Test approved HTTPS endpoints from at least two networks. Review both passed and failed tests. A failed test does not always mean that a server is offline.
- [ ] Check desktop and mobile layouts in both languages and themes. Also test larger text and keyboard controls.
- [ ] Import one valid and one invalid CSV file. Check column roles, row errors, duplicate merging, Probe URL matching, and exports.
- [ ] Select A and B, clear the selection, delete one point, and use Delete all. Make sure every delete action asks for confirmation.
- [ ] Open, close, and clear the Activity Console. Check its language, long IPv6 wrapping, and removal of secret-like text.
- [ ] Publish the correct repository with the MIT license and credit for the earlier project. Do not include local settings, installed packages, or secrets.
- [ ] Open the public app in a signed-out browser. Confirm the deployed design before you take the final screenshots.
- [ ] Read the official contest rules. Check the deadline and all required form fields.

## Writing about the project

Describe the project as a tool that helps users compare servers and explains its results. Keep geographic data separate from HTTP tests made by the browser. State the known limits and make only claims that this version can show. Do not call the score a percentage, traceroute result, uptime promise, or test from another country.
