# SakuraTH GeoIP2Route user guide

This document is the detailed copy deck for the user guide. Capture the final screenshots from the same application release, then add callouts and crop them in Photoshop so labels, values, and controls remain consistent with the text.

- Live application: <https://sakurath-geoip2route.netlify.app/>
- Source repository: <https://github.com/timor2542/sakurath-geoip2route>
- Documentation version: `v1.8.0`

## 1. What the application does

SakuraTH GeoIP2Route uses IP2Location data for two related workflows:

1. **IP Compare** selects two locations, A and B, then compares their great-circle distance, country, city, ISP, ASN, network type, and timezone.
2. **Server Ranking** selects one geographic reference IP and ranks every other point as a candidate server with inspectable scoring evidence.

The application is not a traceroute, ICMP ping tool, load balancer, or automatic traffic-routing system. Lines on the map show geographic relationships, not packet paths.

> **Opening-image copy:** Compare IP locations and rank server candidates with transparent scoring evidence.

## 2. Screen layout and symbols

The desktop workspace has four main areas:

1. The header contains the reference date/time, Refresh, Help, language, and theme controls.
2. The left panel selects a mode, adds/imports IPs, and selects A/B or the reference IP.
3. The center map shows markers, a graticule, a dynamic distance scale, and zoom controls.
4. The right panel shows the comparison or ranking result.

The **Activity Console** below the map records actions performed in the current browser session.

Marker and data labels:

- Pink `A`: first comparison point
- Yellow `B`: second comparison point
- Green `SRC`: geographic ranking reference
- `1`, `2`, `3`, ...: server rank
- Gray marker: another unselected point
- `LIVE`: returned by an IP2Location lookup
- `SAMPLE`: bundled example location
- `SIMULATED`: clearly labelled demonstration evidence

> **Screenshot 1 — Workspace overview:** Use a desktop landscape viewport and label the header, control panel, map, result panel, and Activity Console.

![Mobile workspace overview showing the map, markers, scale, language and theme controls](guide-start.jpg)

*Reference image — On a narrow screen, the map appears first and the working panels continue below it.*

## 3. Reference time, language, and theme

The header clock follows the active geographic reference:

- IP Compare uses point A.
- Server Ranking uses `SRC`.
- Before a selection exists, the first point is used; the device clock is the final fallback.

Thai uses a 24-hour clock and Buddhist Era year with `พ.ศ.` before the year. English uses a 12-hour clock with AM/PM and an `AD` label.

The sun, moon, and half-filled-circle buttons select Light, Dark, and Automatic themes. The browser remembers language, theme, and Activity Console visibility.

> **Screenshot 2 — Header:** Crop the clock, country/timezone code, EN/TH selector, and theme control. Add a callout explaining that A or `SRC` supplies the reference timezone.

## 4. Quick exploration

The initial list contains eight sample locations, so markers, selection, comparison, and geographic ranking can be explored immediately.

**Try Demo — Simulated Data** adds a separate demonstration set and opens Server Ranking. It illustrates why nearest and fastest can produce different winners. Simulated evidence is labelled and is never mixed into measured browser scoring.

**Load Live Test Example** prepares a `target,probe_url` example in the import dialog. The user still starts the lookup and HTTP measurement explicitly.

![Quick Guide dialog explaining how to add IPs, compare points, and rank servers](guide-help.jpg)

*Reference image — The built-in Help dialog summarizes the three main stages without requiring an API lookup.*

## 5. Add one IP or hostname

### Add a public target

1. Find **ADD IPs TO THE LIST**.
2. Enter a public IPv4 address, IPv6 address, or hostname, such as `8.8.8.8`, `2606:4700:4700::1111`, or `example.com`.
3. Press `+` or Enter.
4. Wait for the lookup status.
5. The resolved point appears in the list and on the map.

If a hostname resolves to an IP already present, the existing point is updated instead of creating a duplicate marker. Local, private, or reserved literal addresses are rejected, as are targets containing credentials or custom ports.

### Add the current public IP

1. Press **Add current IP**.
2. The application detects the public connection IP and requests its IP2Location data.
3. The point is added or updated.
4. It becomes A in IP Compare and `SRC` in Server Ranking.

A failed live lookup displays an error and never invents location data.

> **Screenshot 3 — Add a target:** Crop the left panel from Add current IP through the target field. Number the field, `+` button, and progress/status areas.

## 6. Paste multiple targets

1. Press **Paste list**.
2. Enter one IP or hostname per line.
3. Check the Current list and Incoming list counts.
4. Select Append or Replace.
5. Start the lookup.

Lines beginning with `#` are comments. Duplicate targets are removed before lookup. One import can contain at most 200 unique targets.

```text
8.8.8.8
1.1.1.1
example.com
2606:4700:4700::1111
```

> **Screenshot 4 — Paste list:** Show four example lines, both list counts, and the Append/Replace choices.

## 7. Import and review CSV

![Left control panel showing the target field, Paste list, Import CSV, Clear selection, and Delete all controls](guide-import-csv.jpg)

*Reference image — Import CSV is beside Paste list in the left panel. Clear selection keeps the IPs; Delete all removes them after confirmation.*

### Minimal file

```csv
ip
8.8.8.8
1.1.1.1
```

Target header aliases are `target`, `ip`, `ip_address`, `address`, `hostname`, and `host`. Column order is flexible.

### File with an optional probe

```csv
target,probe_url
dns.google,https://dns.google/resolve?name=example.com&type=A
```

Probe header aliases are `probe_url`, `probe`, and `health_url`. A probe must use HTTPS and its hostname/IP must match the target in the same row.

Country, country code, region, city, latitude, longitude, ISP, ASN, usage type, and timezone columns are recognized as **Reference only**. Live lookup data supplies the operational map location. Unknown columns are marked **Ignored**.

### Review before lookup

1. Press **Import CSV** and choose a `.csv` or `.txt` file.
2. The browser reads the file locally before any lookup starts.
3. Confirm that the structure status is valid.
4. Check Column mapping for the required Target and optional Probe roles.
5. Review Rows checked, Valid rows, and Invalid rows.
6. Inspect the first three rows in Preview.
7. Correct any reported row numbers before importing.

Detected errors include a missing or duplicate Target header, duplicate Probe header, invalid Target/Probe value, a probe hostname mismatch, extra cells, and an unclosed CSV quote.

The file limit is 1 MiB and the record limit is 200 unique targets.

### Append or replace

- **Append to current list — Recommended** keeps existing points, adds new targets, and merges resolved-IP duplicates.
- **Replace current list** uses successful results from the new import as the new list.

If every replacement lookup fails, replacement is aborted and the existing list is preserved. Lookup progress displays both a count and progress bar, with at most three lookups running concurrently.

> **Screenshot 5 — Valid CSV:** Use `country_name,city_name,ip` and show Column mapping, metrics, and the first three preview rows.
>
> **Screenshot 6 — Invalid CSV:** Include one invalid target and highlight the Invalid rows count and exact row message.
>
> **Screenshot 7 — Import choice:** Label Append as “keep current list” and Replace as “replace current list safely.”

## 8. Compare two IPs

1. Select **IP Compare**.
2. Select a map marker or row in **MAP POINTS**; it becomes A.
3. Select another point; it becomes B.
4. Selecting a third point replaces B while A remains selected.
5. Read the A–B line and comparison panel.

The panel contains great-circle distance, country, region/city, ISP, ASN, IP usage type, timezone, and same/different summaries for country, ASN, and network type.

IP geolocation is approximate. Anycast targets may resolve to different network locations.

> **Screenshot 8 — Comparison result:** Use Bangkok as A and Singapore as B. Include the markers, line, A/B cards, distance, comparison table, and difference chips.
>
> **Image copy:** Select any two points to compare geographic and network evidence side by side.

## 9. Rank server candidates

![Server Ranking panel showing the geographic reference IP and ranking method controls](guide-server-ranking.jpg)

*Reference image — Select the reference IP and ranking method before reviewing the candidate results.*

### Select the reference

1. Select **Server Ranking**.
2. Choose a **Geographic reference IP**.
3. The reference becomes `SRC` and is excluded from the candidate ranking.
4. Every other point becomes a candidate server.

Changing `SRC` changes geographic distance. It does not change the origin of browser HTTP requests, which always originate from the browser running the application.

### Geographic fit

```text
distance_score = clamp(100 - distance_km / 200.37, 0, 100)
Geographic fit = 80% distance_score + 20% network_preference
```

Network preference is DCH/CDN 100, ISP 82, MOB 70, and other/unknown 76. A 0–100 score is a comparison heuristic, not a percentage, SLA, or performance guarantee.

### Browser HTTP

```text
http_score = clamp(100 - median_successful_http_ms / 4, 0, 100)
Browser HTTP fit = 80% http_score + 20% network_preference
```

To measure a candidate:

1. Select it from the ranking table.
2. Enter a small CORS-enabled HTTPS endpoint in **Candidate HTTPS probe URL**.
3. The hostname/IP must match the candidate; custom ports, URL credentials, and fragments are rejected.
4. Press **Save & measure** or **Measure now**.
5. Repeat for other candidates, or use **Measure configured URLs**.

Each candidate receives three sequential credential-free GET requests with a 4.5-second timeout per request. The median of successful response-header timings is used. The body is cancelled because this is not a throughput test. At most two candidates are measured concurrently.

A failed probe remains unmeasured; it is not labelled offline because CORS, TLS, redirects, or browser connectivity may be responsible.

### Read the result

The **RECOMMENDED SERVER** card shows the winner, overall score, rating, timing status, distance, network type, evidence type, weighted component contributions, and the lead over the next candidate.

The **SERVER RANKING** table lists every candidate. Selecting a row reveals IP, ISP, ASN, timing, distance, score, measurement count/time, and probe controls.

> **Screenshot 9 — Ranking setup:** Show `SRC`, Rank using, candidate markers, and the ranking list.
>
> **Screenshot 10 — Recommendation:** Crop the winner card, score breakdown, and “Why this candidate ranks first.”
>
> **Screenshot 11 — HTTP evidence:** Show a successful `3/3` result and median timing. Caption it “Measured from this browser; not ICMP ping.”

## 10. Export evidence

Server Ranking provides:

- **Export JSON** for structured formula, component, and measurement data
- **Export CSV** for spreadsheet analysis

Exports include rank, target/IP, country, scoring basis, score, geographic reference, distance, measurement type/origin, HTTP median, successful attempts, UTC measurement time, probe URL, network type, and component contributions. Formula-leading CSV values are neutralized before export.

> **Screenshot 12 — Export:** Crop the JSON/CSV buttons and place examples of both output files beside them.

## 11. Map controls

- `+`: zoom in
- `−`: zoom out
- Corners icon: center and fit every point
- Graticule: helps read geographic scale
- Lower-right scale: shows the approximate distance represented by one grid cell and updates with zoom
- Marker click: shows city, IP, and network details

Compare and ranking lines are geographic only; they do not show hops or packet routes.

## 12. Clear and delete actions

- **Clear A/B selection** removes only A/B state and keeps every point.
- **Clear** in Activity Console removes only console entries.
- A row trash button opens confirmation for one point.
- **Delete all** opens confirmation for every point.

Confirming Delete all also resets A/B, `SRC`, the selected candidate, and current probe workspace state.

> **Screenshot 13 — Deletion confirmation:** Show the affected count, Cancel, and the destructive confirmation button. Cancel after capturing so the sample workspace remains intact.

## 13. Activity Console

The session console can show `[INFO]`, `[WAIT]`, `[OK]`, `[ERROR]`, and `[DEMO]` events. It explains browser activity only and is not a durable server log. It can be collapsed, expanded, or cleared independently from map data.

> **Screenshot 14 — Activity Console:** Show representative WAIT, OK, and ERROR lines, with any private/internal values redacted.

## 14. Mobile and accessibility behavior

- Narrow screens place the map first and stack the panels below it.
- Interactive controls expose screen-reader labels and tooltips.
- Tab moves keyboard focus through controls.
- Enter submits the add-IP form.
- Escape closes an idle dialog.
- Modal focus remains inside the dialog until it closes.
- Reduced-motion preferences are respected.

Capture at least one mobile viewport and verify English/Thai plus Light/Dark before producing final artwork.

## 15. Photoshop production checklist

1. Capture every desktop image at one resolution, such as `1920×1080`.
2. Keep browser zoom at 100% and use Fit all points before map captures.
3. Reuse one sample dataset so A/B, `SRC`, ranks, and distances remain continuous.
4. Keep each image in one language unless the comparison is intentional.
5. Preserve section headings before adding arrows or numbered callouts.
6. Match UI colors: pink for A/winner, yellow for B, green for `SRC`.
7. Keep Leaflet/OpenStreetMap attribution visible.
8. Redact API keys, tokens, private URLs, and personal data.
9. Do not edit displayed scores or measurements into values the app did not produce.
10. Check spelling, release version, date format, and links before export.

## 16. Short callout copy

- **Overview:** Compare IP locations and rank server candidates in one workspace.
- **Add IP:** Add a public IP, IPv6 address, or hostname and let IP2Location supply location evidence.
- **CSV:** Review headers, column roles, and exact invalid rows before lookup.
- **Import mode:** Append safely or replace the current list with successful results.
- **Compare:** Select A and B for a side-by-side geographic and network comparison.
- **Ranking:** Choose `SRC`, then inspect every candidate's score and evidence.
- **HTTP:** Measure an HTTPS endpoint three times and use the successful median.
- **Map:** The graticule and dynamic scale update with zoom.
- **Delete:** Clearing selection is different from deleting IPs; deletion always asks for confirmation.
- **Accuracy:** IP geolocation is approximate, and map lines are not traceroute paths.

## 17. Limitations to state clearly

- IP geolocation is approximate and is not GPS.
- Anycast/CDN targets may resolve differently.
- Great-circle distance is not network-path distance.
- Browser timing can include DNS, connection, TLS, server work, and browser scheduling.
- Scores are comparison heuristics, not SLAs or automatic routing decisions.
- The working list and measurements reset when the page reloads.
