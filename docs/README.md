# Project documents

[Back to the English README](../README.md) | [อ่านภาษาไทย](README.th.md)

This folder contains the technical and contest documents for SakuraTH GeoIP2Route. Choose the document that fits your task:

| Document | Use it for |
|---|---|
| [USER-GUIDE.md](USER-GUIDE.md) | Illustrated steps for adding data, importing CSV, comparing IPs, ranking servers, and exporting results |
| [ALGORITHM.md](ALGORITHM.md) | Scoring formulas, HTTP tests, import limits, and known limits |
| [../CHANGELOG.md](../CHANGELOG.md) | Version history |

## Suggested reading order

1. Read the main [README](../README.md) to learn about the product and run it.
2. Read [USER-GUIDE.md](USER-GUIDE.md) for detailed steps with application screenshots.
3. Read [ALGORITHM.md](ALGORITHM.md) before you explain a score.

## What the product does not do

GeoIP2Route compares IP locations and ranks possible servers. It does not run traceroute or ICMP ping. It also does not find packet routes, manage failover or load balancing, or test from remote agents. Map distance is an estimate. HTTP time is a separate result measured by the user's browser.

## Release details

- Release candidate: `v1.8.0`
- Node.js: `20.19+` or `22.12+`
- Import limit: 200 unique targets and 1 MiB per file
- Browser test: three GET requests, the median successful response time, and a 4.5-second timeout for each request
- Automated suite: 45 tests plus the structural smoke check
- Netlify function limits: 60 lookups/minute and 20 current-IP requests/minute per IP/domain

Keep these numbers in line with the code. Update this page when they change.
