# Contest submission copy — v1.8.0

Use this text after the source repository and public application have been checked from a signed-out browser.

## Project title

**SakuraTH GeoIP2Route — Explainable Geo-Aware Server Ranking**

## Short description

An explainable server-comparison application powered by IP2Location.io. It compares IPv4/IPv6 locations, ranks candidates by geographic fit, separately measures authorized HTTPS response time from the browser, explains the evidence, and exports the result without presenting map distance as network latency.

## Source code URL

`https://github.com/timor2542/sakurath-geoip2route`

Verify that the URL points to the intended public repository before submitting it.

## Remarks

GeoIP2Route is a substantial successor to my 2025 SakuraTH GeoIP2Map entry. The earlier project visualized one IP location; this release adds a shared IPv4/IPv6 list, pairwise comparison, geographic ranking, opt-in browser HTTP measurements, transparent score explanations, JSON/CSV exports, duplicate-safe refresh, rate-limited serverless access, and automated tests. Geographic evidence and measured browser evidence remain separate, and the documented limits avoid claiming traceroute, ping, or remote-origin latency.

## Final form check

- [ ] The public repository opens and the English and Thai README files render correctly.
- [ ] The deployed application opens without an account and uses the intended release version.
- [ ] The server-side production configuration is present and no secret appears in source, bundle, screenshot, or submission text.
- [ ] The release checklist is complete and both Netlify rate-limit rules are visible in deployment logs.
- [ ] Current screenshots show the real interface and no draft placeholders.
- [ ] The title, short description, repository URL, and application URL contain no unfinished placeholders.
