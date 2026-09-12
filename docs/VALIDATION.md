# Validation record — v1.8.0

Validation snapshot: 2026-09-11

## Verified in the repository

| Area | Result |
|---|---|
| Structural smoke check | Passed |
| Automated logic, CSS, and markup checks | 45 passed, 0 failed |
| Production Vite build | Passed |
| Ranking and evidence separation | Passed with mocked responses |
| CSV preflight | Valid/invalid states, flexible header order, detected roles, preview rows, and exact row errors passed |
| IPv4/IPv6 identity and duplicate merging | Passed, including refreshed DNS convergence and selection remapping |
| Current-IP validation and error handling | Passed with mocked discovery and geolocation |
| Browser HTTP measurement rules | Passed with mocked CORS, timeout, partial-success, and unavailable cases |
| Address wrapping and input behavior | Passed for full IPv4/IPv6 values, Enter submission, and IME composition |
| Activity Console | Passed for action wiring, secret filtering, 200-entry cap, responsive markup, and collapse behavior |
| Terminal progress | Passed for real stages, failures, concurrency, and non-TTY output |
| Netlify rate-limit declarations | Passed in source: lookup 60/minute and current IP 20/minute per IP/domain |
| Warm-instance GeoIP cache | Passed with mocked repeated requests and caller-mutation checks |

## Still required on the intended deployment

- [ ] Verify the live IP2Location response, plan-dependent fields, quota behavior, and current-IP detection.
- [ ] Verify both Netlify rate-limit rules in the deployment log and observe the platform response when exceeded.
- [ ] Test the public application in a signed-out browser on desktop and mobile, in English and Thai, with both themes.
- [ ] Test authorized HTTPS probes from more than one network and inspect the honest unavailable state.
- [ ] Confirm the published repository, release version, screenshots, application URL, and contest eligibility.

## Interpretation

The automated suite validates deterministic logic, safety rules, markup wiring, and compilation. It does not establish real network latency, upstream availability, visual pixel layout, deployed configuration, or contest eligibility. Use [RELEASE-CHECKLIST.md](RELEASE-CHECKLIST.md) to close the remaining live checks.
