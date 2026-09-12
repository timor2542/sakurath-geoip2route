# Ranking method and evidence — v1.8.0

## Geographic distance

IP Compare and Server Ranking use the Haversine formula with an Earth radius of 6,371 km. The code keeps the temporary value between 0 and 1. This prevents rounding errors for points on opposite sides of Earth. The app rejects missing or invalid coordinates instead of placing them at (0,0).

This is an estimated direct distance between two IP locations. It is not the length of the network path.

## Two ranking methods

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

The network values and score limits are product settings. They are not predictions proven by research. An unknown network type gets a middle value, but the app does not guess its real type. Network type can have more effect than a small distance or time difference. The winner has the highest total score. It may not have the shortest distance or lowest HTTP time.

Scores go from 0 to 100, but they are not percentages. The app shows the weighted parts of each score and the gap to the next server. If scores are equal, the app uses a stable internal ID to keep the order steady. Servers without a measurement stay visible, but they have no score or rank.

The app does not include the geographic reference in the server list. It uses this reference only to calculate distance. **The Browser HTTP test does not start from the selected reference IP.** It starts from the user's browser. Changing the reference does not change a server's HTTP score.

## Browser HTTP test

Implementation: `src/services/probe.js`.

- The app sends three GET requests, one after another. It measures from the start of `fetch` until it receives the response headers.
- It uses the median of successful tests. For an even number, it uses the middle point between the two central values.
- It tests no more than two server URLs at the same time.
- Each request stops after 4.5 seconds.
- The URL must use HTTPS and match the server hostname or IP. Custom ports, login details, and URL fragments are not allowed.
- Requests use CORS. They send no browser login data or referrer, follow no redirects, and do not use stored cache results.
- Only readable 2xx responses are successful. Responses hidden by the browser, also called opaque responses, do not count. Status zero does not count either.
- The app cancels the response body because it does not test download speed.
- If all tests fail, the server has no median or rank. The app does not call it offline.
- If some tests pass, the median uses only successful results. The app shows the exact number of successful tests.

This test is not ICMP ping, download speed, or a test from another country. The result can include connection setup, server work, browser tasks, service workers, network changes, and reused connections. For a fair comparison, use similar small endpoints and repeat the tests.

A hostname may point to different IPs on the app server and in the browser. This is common with CDN and Anycast services. Host matching helps prevent tests of the wrong server, but it cannot prove a direct test to one IP. The app blocks local and reserved IP addresses entered as targets. This browser check does not fully test for DNS rebinding or every possible hostname change.

## Lookups, imports, and exports

- The server uses the IP2Location key to look up public IPs and hostnames.
- The app runs up to three lookups at the same time. Each import can contain 200 unique targets and can be up to 1 MiB.
- The app merges items that resolve to the same IP. Refresh also merges results into the current list. It does not bring back a point that the user deleted during refresh.
- The app does not find packet routes or create GeoJSON. JSON and CSV exports contain ranking evidence.
- Exports include the scoring method, formula, geographic reference, test origin, successful results, and test time.
- CSV export makes text that starts like a spreadsheet formula safe.
- Measurements and the working list reset when the page reloads. The app does not claim to store a permanent dataset.

## Known limits

The score helps users compare servers. It must not make production routing decisions by itself. It does not prove uptime, correct application behavior, connection quality, data location, or legal compliance. A production system also needs repeated tests, health checks, operating rules, and permission to test each endpoint.
