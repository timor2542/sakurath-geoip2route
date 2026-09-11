# Contest submission copy — v1.8.0

Use this copy only after the public repository and live demo have been tested from a signed-out browser.

## Project title

SakuraTH GeoIP2Route — Explainable Geo-Aware Server Ranking

## Short description

An explainable server-comparison application powered by IP2Location.io. It compares IPv4/IPv6 locations, ranks candidates by geographic fit, separately measures browser HTTP response time, and exports the evidence without presenting map distance as network latency.

## Source code URL

Publish and verify the intended repository at `https://github.com/timor2542/sakurath-geoip2route` before placing that URL in the submission form.

## Remarks

GeoIP2Route is a substantial successor to my 2025 SakuraTH GeoIP2Map entry. The earlier project visualized one IP location; this release adds a shared IPv4/IPv6 candidate list, pairwise comparison, geographic ranking, opt-in browser HTTP measurements, explicit simulated/live evidence labels, score explanations, exports, duplicate-safe refresh, rate-limited serverless API access and automated tests. Geographic and measured evidence remain separate, and the documented limits avoid claiming traceroute, ping or remote-origin latency.

## Suggested social post

🌸 SakuraTH GeoIP2Route turns IP geolocation into an explainable server-selection workflow. Compare IPv4/IPv6 locations, rank geographic fit, verify authorized HTTPS response times from your browser, inspect every score contribution, and export the evidence. Powered by IP2Location.io.

Add the verified GitHub link and live-demo link, then include `#ProgrammingContest #IP2LocationContest`.

## Final form check

- The source repository is public and the README renders correctly.
- The live demo opens without an account and the simulated-data label is visible.
- The API key is stored only in the host environment.
- `CHECK-CONTEST-READY.bat` passes on the release ZIP.
- Netlify confirms both rate-limit rules in the deployment log.
- Current screenshots/GIF show v1.8.0 rather than an earlier interface.
- The short description, repository URL and live-demo URL contain no draft placeholders.
