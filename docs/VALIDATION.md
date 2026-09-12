# Test record — v1.8.0

Check date: 2026-09-11

## Verified in the repository

| Area | Result |
|---|---|
| Structural smoke check | Passed |
| Automated logic, CSS, and markup checks | 45 passed, 0 failed |
| Production Vite build | Passed |
| Separate ranking evidence | Passed with test responses |
| CSV review | Passed for valid and invalid files, any header order, column roles, preview rows, and exact row errors |
| IPv4/IPv6 matching and duplicate merging | Passed, including DNS results that later point to the same IP and updates to the selection |
| Current-IP checks and errors | Passed with test responses for IP discovery and location |
| Browser HTTP test rules | Passed for CORS, timeout, partial success, and unavailable results |
| Address display and input | Passed for full IPv4/IPv6 values, Enter, and IME text entry |
| Activity Console | Passed for app actions, secret removal, the 200-entry limit, small screens, and open/close behavior |
| Terminal progress | Passed for real stages, errors, tests at the same time, and output without an interactive terminal |
| Netlify rate limits | Passed in the code: 60 lookups and 20 current-IP requests per minute for each IP/domain |
| Short-term GeoIP cache | Passed with repeated test requests and checks that callers cannot change stored data |

## Still required on the intended deployment

- [ ] Check the live IP2Location response, fields included in the plan, quota use, and current-IP detection.
- [ ] Check both Netlify rate limits in the deployment log. Review the platform response after a user reaches a limit.
- [ ] Test the public app while signed out. Use desktop and mobile, English and Thai, and both themes.
- [ ] Test approved HTTPS endpoints from more than one network. Check that unavailable results are clear and honest.
- [ ] Confirm the public repository, version, screenshots, app URL, and that the project follows the contest rules.

## What the results mean

The automated tests check stable logic, safety rules, page controls, and the production build. They do not prove real network speed, API availability, exact visual layout, live settings, or that the project follows every contest rule. Use [RELEASE-CHECKLIST.md](RELEASE-CHECKLIST.md) to complete the live checks.
