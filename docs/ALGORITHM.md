# Ranking evidence and algorithm — v1.8.0

## Geographic distance

IP Compare and ranking use Haversine distance with Earth radius 6,371 km. The intermediate value is clamped to [0,1] to avoid floating-point errors near antipodal coordinates. Invalid or missing upstream coordinates are rejected instead of silently mapped to (0,0).

This is a great-circle estimate between IP geolocation coordinates, not the network path.

## Separate ranking bases

Implementation: `src/utils/ranking.js`.

```text
distance_score = clamp(100 - distance_km / 200.37, 0, 100)
http_score     = clamp(100 - median_successful_http_ms / 4, 0, 100)

network preference:
  DCH or CDN = 100
  ISP        = 82
  MOB        = 70
  other/unknown = 76

Geographic fit = 0.8 × distance_score + 0.2 × network_preference
Browser HTTP  = 0.8 × http_score     + 0.2 × network_preference
```

Network preference and normalization constants are explicit product choices, not empirically validated predictions. Unknown network data receives a neutral-ish default, not a claimed classification. A different network preference can outweigh a small distance or timing difference. The winning candidate has the highest combined score, not necessarily the shortest raw distance or lowest raw timing.

Scores range from 0 to 100 and are not percentages. Each component's weighted contribution and the gap to the next ranked candidate are shown. Ties are ordered by stable ID. Unmeasured candidates remain visible with null score and null rank.

The geographic reference is excluded from the candidate list. It supplies distance only; **Browser HTTP never treats the selected IP as the origin of the HTTP request**. Changing the reference does not change another candidate's HTTP score.

## Browser measurement

Implementation: `src/services/probe.js`.

- Three sequential GET requests, timed from fetch start until response headers.
- Median of successful samples; an even count uses the midpoint of the two central samples.
- At most two candidate URLs measured concurrently.
- Each request has a 4.5-second abort timeout.
- HTTPS only, matching candidate hostname/IP, no custom ports, no URL credentials/fragments.
- CORS mode, no browser credentials, no referrer, no redirects, no-store cache request, cache-busting query value.
- Only readable 2xx responses count as successful; opaque/status-zero responses do not.
- Response body is cancelled because transfer throughput is not measured.
- No successful samples: null median and unranked, not offline.
- Partial success: median uses successful requests and the exact success/attempt count is displayed.

This is not ICMP ping, pure wire latency, TLS-only timing, throughput, or a measurement from a remote selected country. It can include connection setup, server work, browser scheduling, service-worker effects, network variation and warm connections. Compare equivalent small endpoints and repeat measurements.

A hostname can resolve differently on the app server and browser, especially with CDN/anycast. Host matching reduces accidental misattribution but cannot prove direct-to-IP measurement. Literal local/reserved targets are blocked; DNS rebinding and arbitrary hostname resolution are not audited by this client-side check.

## Lookup, import and exports

- Public IPs/hostnames are resolved using a server-side IP2Location key.
- Up to three lookup workers, 200 unique targets per import and 1 MiB file limit.
- Same resolved IP is deduplicated. Refresh merges into the current list, so deleting a point during refresh does not resurrect it.
- GeoJSON/route discovery is not performed; JSON and CSV contain ranked candidate evidence.
- Exports record the scoring basis, formula, geographic reference/source, measurement origin, successful samples and time.
- Spreadsheet formula-leading strings are neutralized in CSV export.
- Measurements and the working list reset on reload; no durable dataset is claimed.

## Known limits

The score is a comparison aid, not an automated production routing decision. It does not establish uptime, application correctness, peering quality, geographic residency, or compliance. A production selector needs repeated measurements, health checks, operational constraints and endpoint authorization.
