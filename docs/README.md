# Project documentation

[Back to the English README](../README.md) | [อ่านภาษาไทย](README.th.md)

This folder contains the technical and contest documents for SakuraTH GeoIP2Route. Start with the document that matches your task:

| Document | Use it for |
|---|---|
| [USER-GUIDE.md](USER-GUIDE.md) | Step-by-step app usage with screenshots |
| [ALGORITHM.md](ALGORITHM.md) | Scoring formulas, HTTP measurement evidence, import limits, and known limitations |
| [SUBMISSION.md](SUBMISSION.md) | Contest title, short description, remarks, and final-form wording |
| [RELEASE-CHECKLIST.md](RELEASE-CHECKLIST.md) | The checks to complete before publishing or submitting |
| [VALIDATION.md](VALIDATION.md) | What has been verified and what still needs a live check |
| [../CHANGELOG.md](../CHANGELOG.md) | Version history |

## The shortest useful reading order

1. Read the root [README](../README.md) to understand the product and run it.
2. Read [ALGORITHM.md](ALGORITHM.md) before describing a score as a result.
3. Follow [RELEASE-CHECKLIST.md](RELEASE-CHECKLIST.md) before a public deployment.
4. Copy the verified wording from [SUBMISSION.md](SUBMISSION.md) into the contest form.
5. Use [VALIDATION.md](VALIDATION.md) to distinguish automated evidence from checks that require the live deployment.

## Product boundaries

GeoIP2Route compares IP geolocation and ranks candidate servers. It does not perform traceroute, ICMP ping, packet-route discovery, failover, load balancing, or remote-agent testing. Geographic distance is an estimate; browser HTTP timing is a separate signal measured from the browser that runs the application.

## Release facts

- Release candidate: `v1.8.0`
- Node.js: `20.19+` or `22.12+`
- Import limit: 200 unique targets and 1 MiB per file
- Browser probe: three GET requests, median successful response-header timing, 4.5-second timeout per request
- Automated suite: 45 tests plus the structural smoke check
- Netlify function limits: 60 lookups/minute and 20 current-IP requests/minute per IP/domain

Keep these numbers consistent with the implementation and update this index when a release changes them.
