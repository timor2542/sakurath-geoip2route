# Validation record — v1.8.0

Date: 2026-09-11

| Check | Result |
|---|---|
| Application structural smoke check | Passed |
| Automated logic, CSS and component markup checks | 45 passed, 0 failed |
| Local browser layout | Desktop 1440×900 and mobile 360×800 checked; no horizontal overflow after the responsive-header fix |
| Mobile demo handoff | Demo moves focus and scrolls directly to the recommended-server result |
| Dialog keyboard behavior | Help and bulk-import dialogs expose modal semantics, move/restore focus, trap Tab and close with Escape |
| In-page Activity Console | SSR markup, action wiring, 200-entry cap and responsive CSS passed |
| Console secret filtering | Key/token examples redacted; complete IPv4/IPv6 values retained |
| Demo/live button copy and descriptions | EN/TH labels and accessible description links verified in source |
| Production Vite build | Passed |
| External HTTP and IP2Location tests | Mocked responses only |
| Current-IP discovery, deduplication and errors | Passed with mocked discovery, DNS and geolocation |
| IPv6 textual variants and DNS convergence on refresh | Passed; canonical identity and post-refresh merging |
| A/B and ranking selections after merging | Passed; remapped to surviving IDs, no duplicate A/B selection |
| Manual, CSV and current-IP page actions | Passed with mocked API results; not browser interaction tests |
| CSV preflight review | Valid and invalid CSV states checked in the local browser: flexible header order, detected roles, reference-only metadata, preview rows, exact row errors and disabled submit on invalid input |
| Full IPv4/IPv6 component markup and wrap declarations | Passed; source/SSR markup checks only, not pixel layout |
| Growing input value preservation and Enter/IME behavior | Passed with mocked element dimensions and events |
| Terminal progress and concurrent requests | Passed with captured TTY/non-TTY output; no real API request |
| Time-zone portability | Passed in the validation environment that exposed the previous half-hour-zone test defect |
| Netlify code-based rate limits | Source configuration passed: lookup 60/minute and current IP 20/minute per IP/domain; deployment log not verified |
| Warm-instance GeoIP cache | Repeated-request and caller-mutation checks passed with mocked upstream data |
| GitHub Actions | Workflow included; it has not run until the repository is published |
| Live IP2Location API key | Not configured or exercised in this validation |
| Browser visual/interaction QA | Preview server started, but the validation browser was blocked from opening it; desktop/mobile, EN/TH and light/dark interaction QA remain incomplete |
| GitHub publication / hosted live demo | Not performed |

The checks validate deterministic logic, quota-protection declarations and compilation. They do not establish real network latency, live API availability, deployed rate-limit activation, mobile layout correctness, or contest eligibility. Follow RELEASE-CHECKLIST.md before a public submission.
