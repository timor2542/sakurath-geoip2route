# User guide

SakuraTH GeoIP2Route is a browser-based tool for comparing IP locations and ranking candidate servers with IP2Location data.

## Open the app

- [Live application](https://sakurath-geoip2route.netlify.app/)
- [Source repository](https://github.com/timor2542/sakurath-geoip2route)

The application starts with eight labelled sample locations so the main workflow can be tested without an API key.

![Start screen with the map, markers, zoom controls, and IP Compare mode](guide-start.jpg)

## 1. Add IP addresses

Use the **ADD IPs TO THE LIST** section:

- Enter one public IP address or hostname, then press `+`.
- Use **Paste list** for one target per line.
- Use **Import CSV** for a CSV file containing an `ip` or `target` column. The review screen identifies detected columns, previews the first rows, and reports valid and invalid targets before anything is added.

![IP list controls and map-point actions](guide-import-csv.jpg)

The browser sends lookup requests only after you confirm the import. Existing targets are de-duplicated.

## 2. Compare two points

1. Leave **IP Compare** selected.
2. Click two map markers or two rows in **MAP POINTS**. The first selection becomes point A and the second becomes point B.
3. Read the comparison panel for great-circle distance, country, region/city, ISP, ASN, usage type, and timezone.

The map line shows a geographic relationship; it is not a traceroute path.

## 3. Rank server candidates

![Server Ranking mode](guide-server-ranking.jpg)

1. Select **Server Ranking**.
2. Choose the geographic reference IP.
3. Select **Geographic fit** for distance and network-preference scoring.
4. Optionally add a matching CORS-enabled HTTPS **Probe URL** to a candidate, then measure it from the browser.

Geo fit combines distance (80%) and network preference (20%). Browser HTTP ranking uses measured response-header timing as a separate signal.

## 4. Use the map

- `+` and `−` change the map zoom.
- The corners icon fits all points in view.
- The grid and lower-right scale show the current geographic scale.
- Click a marker to see its city, IP, and network details.

## 5. Clear or remove points

- **Clear A/B selection** keeps every IP but removes the comparison selection.
- The trash icon on a row removes only that IP.
- **Delete all** removes every point after a confirmation prompt.

## 6. Open the built-in help

![Built-in quick guide](guide-help.jpg)

Click the `?` button in the header for a short explanation of adding IPs, comparing points, and ranking candidates.

## Important notes

- IP geolocation is approximate and is not GPS.
- HTTP timing is measured from the browser running the app; it is not ICMP ping or traceroute.
- A valid API key is required for live IP2Location lookups. The bundled sample data is available for UI exploration.
