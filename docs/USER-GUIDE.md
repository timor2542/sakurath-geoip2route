# SakuraTH GeoIP2Route user guide

This guide explains how to use the app and plan its screenshots. Take all final screenshots from the same app version. You can then crop them and add labels in Photoshop. Make sure the names, values, and controls match this guide.

- Live application: <https://sakurath-geoip2route.netlify.app/>
- Source repository: <https://github.com/timor2542/sakurath-geoip2route>
- Documentation version: `v1.8.0`

## 1. What the application does

SakuraTH GeoIP2Route uses IP2Location data for two main tasks:

1. **IP Compare** lets you select two locations, A and B. It compares their direct map distance, country, city, ISP, ASN, network type, and time zone.
2. **Server Ranking** lets you select one IP as a location reference. It ranks every other point as a possible server and shows how it calculated each score.

The app is not a traceroute tool, ICMP ping tool, load balancer, or automatic routing system. Lines on the map show geographic links, not network packet paths.

> **Opening image text:** Compare IP locations and rank servers with clear scoring details.

## 2. Screen layout and symbols

The desktop workspace has four main areas:

1. The header contains the reference date and time, Refresh, Help, language, and theme controls.
2. The left panel selects a mode and puts the main actions first: **Add current IP**, **Update list from IP2Location**, **ADD IPs TO THE LIST**, and **MAP POINTS** (or **ALL IP POINTS** in Server Ranking). Optional demo controls are at the bottom of this panel.
3. The center map shows markers, a grid, a distance scale that changes with zoom, and map controls.
4. The right panel shows the comparison or ranking result.

The **Activity Console** below the map records actions from the current browser session.

The sticky **Quick navigation** menu in the left panel has five text options: Current IP, Update, Add IP, Points, and Demo. Choose an option to move directly to that section. The menu resets after each jump, so the same section can be selected again.

Marker and data labels:

- Pink `A`: first comparison point
- Yellow `B`: second comparison point
- Green `SRC`: geographic ranking reference
- `1`, `2`, `3`, ...: server rank
- Gray marker: another unselected point
- `LIVE`: returned by an IP2Location lookup
- `SAMPLE`: bundled example location
- `SIMULATED`: test data that is clearly marked

> **Screenshot 1 — Workspace overview:** Use a wide desktop screen. Label the header, Quick navigation menu, control panel, map, result panel, and Activity Console. In the left panel, show the order from Add current IP to Map Points.

![Mobile workspace overview showing the map, markers, scale, language and theme controls](guide-start.jpg)

*Reference image — On a narrow screen, the map appears first. The other panels continue below it.*

## 3. Reference time, language, and theme

The header clock follows the selected location reference:

- IP Compare uses point A.
- Server Ranking uses `SRC`.
- If there is no selection, the app uses the first point. If there are no points, it uses the device clock.

Thai uses a 24-hour clock and a Buddhist Era year with `พ.ศ.` before the year. English uses a 12-hour clock with AM/PM and an `AD` label.

The sun, moon, and half-filled circle select the Light, Dark, and Automatic themes. The browser remembers the language, theme, and whether the Activity Console is open.

> **Screenshot 2 — Header:** Show the clock, country and time-zone code, EN/TH selector, and theme control. Add a label to explain that A or `SRC` sets the time zone.

## 4. Quick exploration

The first list contains eight sample locations. You can use them to try markers, selection, comparison, and geographic ranking at once.

**Try Demo — Simulated Data** adds a separate test set and opens Server Ranking. It shows why the nearest and fastest servers may be different. The app marks test data as simulated and does not mix it with real browser results.

**Load Live Test Example** puts a `target,probe_url` example in the import window. The user must still start the lookup and HTTP test.

Both demo controls are below the main IP and point controls in the left panel. Scroll inside the panel to reach them.

![Quick Guide dialog explaining how to add IPs, compare points, and rank servers](guide-help.jpg)

*Reference image — The Help window explains the three main steps without using the API.*

## 5. Add one IP or hostname

### Add a public target

1. Find **ADD IPs TO THE LIST**.
2. Enter a public IPv4 address, IPv6 address, or hostname, such as `8.8.8.8`, `2606:4700:4700::1111`, or `example.com`.
3. Press `+` or Enter.
4. Wait for the lookup status.
5. The new point appears in the list and on the map.

If a hostname points to an IP already in the list, the app updates the existing point. It does not create a second marker. The app rejects local, private, and reserved IP addresses. It also rejects targets with login details or custom ports.

### Add the current public IP

1. Press **Add current IP**.
2. The app finds the public connection IP and asks IP2Location for its data.
3. The point is added or updated.
4. It becomes A in IP Compare and `SRC` in Server Ranking.

If a live lookup fails, the app shows an error. It never creates false location data.

> **Screenshot 3 — Add a target:** Show the left panel from Add current IP to the target field. Add numbers to the field, `+` button, progress area, and status area.

## 6. Paste multiple targets

1. Press **Paste list**.
2. Enter one IP or hostname per line.
3. Check the Current list and Incoming list counts.
4. Select Append or Replace.
5. Start the lookup.

Lines that start with `#` are comments. The app removes duplicate targets before lookup. One import can contain up to 200 unique targets.

```text
8.8.8.8
1.1.1.1
example.com
2606:4700:4700::1111
```

> **Screenshot 4 — Paste list:** Show four example lines, both list counts, and the Append/Replace choices.

## 7. Import and review CSV

![Left control panel showing the target field, Paste list, Import CSV, Clear selection, and Delete all controls](guide-import-csv.jpg)

*Reference image — Import CSV is next to Paste list in the left panel. Clear selection keeps the IPs. Delete all asks for confirmation and then removes them.*

### Minimal file

```csv
ip
8.8.8.8
1.1.1.1
```

The Target column can use these names: `target`, `ip`, `ip_address`, `address`, `hostname`, or `host`. The columns can be in any order.

### File with an optional probe

```csv
target,probe_url
dns.google,https://dns.google/resolve?name=example.com&type=A
```

The Probe column can use these names: `probe_url`, `probe`, or `health_url`. A Probe URL must use HTTPS. Its hostname or IP must match the Target in the same row.

The app can recognize country, country code, region, city, latitude, longitude, ISP, ASN, usage type, and time zone. It marks these columns as **Reference only**. The live lookup provides the location used on the map. The app marks unknown columns as **Ignored**.

### Review before lookup

1. Press **Import CSV** and choose a `.csv` or `.txt` file.
2. The browser reads the file on your device before any lookup starts.
3. Confirm that the structure status is valid.
4. Check Column mapping for the required Target and optional Probe roles.
5. Review Rows checked, Valid rows, and Invalid rows.
6. Inspect the first three rows in Preview.
7. Correct any reported row numbers before importing.

The app can find several errors. These include a missing or repeated Target header, a repeated Probe header, an invalid Target or Probe value, and a Probe URL that does not match its Target. It can also find extra cells and quotation marks that are not closed.

The file limit is 1 MiB and the record limit is 200 unique targets.

### Append or replace

- **Append to current list — Recommended** keeps existing points, adds new targets, and merges targets that point to the same IP.
- **Replace current list** uses successful results from the new import as the new list.

If all new lookups fail, the app cancels the replacement and keeps the old list. During import, it shows a count and a progress bar. It runs no more than three lookups at the same time.

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

The panel shows direct map distance, country, region and city, ISP, ASN, IP usage type, and time zone. It also shows whether the country, ASN, and network type are the same or different.

IP locations are estimates. Anycast targets may point to different network locations.

> **Screenshot 8 — Comparison result:** Use Bangkok as A and Singapore as B. Include the markers, line, A/B cards, distance, comparison table, and difference chips.
>
> **Image text:** Select any two points to compare location and network data side by side.

## 9. Rank server candidates

![Server Ranking panel showing the geographic reference IP and ranking method controls](guide-server-ranking.jpg)

*Reference image — Select the reference IP and ranking method before you review the server results.*

### Select the reference

1. Select **Server Ranking**.
2. Choose a **Geographic reference IP**.
3. The reference becomes `SRC`. The app does not include it in the ranking.
4. Every other point becomes a possible server.

Changing `SRC` changes the map distance. It does not change where HTTP tests start. These tests always start from the browser that runs the app.

### Geographic fit

```text
distance_score = clamp(100 - distance_km / 200.37, 0, 100)
Geographic fit = 80% distance_score + 20% network_preference
```

The network values are DCH/CDN 100, ISP 82, MOB 70, and other or unknown 76. A score from 0 to 100 helps compare servers. It is not a percentage, service promise, or performance guarantee.

### Browser HTTP

```text
http_score = clamp(100 - median_successful_http_ms / 4, 0, 100)
Browser HTTP fit = 80% http_score + 20% network_preference
```

To measure a candidate:

1. Select it from the ranking table.
2. Enter a small HTTPS URL that allows CORS in **Candidate HTTPS probe URL**.
3. The hostname or IP must match the server. The app rejects custom ports, login details, and URL fragments.
4. Press **Save & measure** or **Measure now**.
5. Repeat for other candidates, or use **Measure configured URLs**.

The app sends three GET requests to each server, one after another. The requests do not include browser login data. Each request stops after 4.5 seconds. The app uses the median successful response time. It cancels the response body because this is not a download speed test. It tests no more than two servers at the same time.

If all tests fail, the server stays unmeasured. The app does not call it offline because CORS, TLS, redirects, or the browser connection may cause the failure.

### Read the result

The **RECOMMENDED SERVER** card shows the winner, total score, rating, test status, distance, network type, type of evidence, score parts, and lead over the next server.

The **SERVER RANKING** table lists every server. Select a row to see its IP, ISP, ASN, HTTP time, distance, score, number and time of tests, and Probe URL controls.

> **Screenshot 9 — Ranking setup:** Show `SRC`, Rank using, candidate markers, and the ranking list.
>
> **Screenshot 10 — Recommendation:** Show the winner card, score parts, and “Why this candidate ranks first.”
>
> **Screenshot 11 — HTTP evidence:** Show a successful `3/3` result and median timing. Caption it “Measured from this browser; not ICMP ping.”

## 10. Export results

Server Ranking provides:

- **Export JSON** for formulas, score parts, and test data in a clear structure
- **Export CSV** for spreadsheet analysis

Exports include the rank, target or IP, country, scoring method, score, location reference, and distance. They also include the test type and origin, HTTP median, successful tests, UTC test time, Probe URL, network type, and score parts. The app makes CSV text safe if it starts like a spreadsheet formula.

> **Screenshot 12 — Export:** Crop the JSON/CSV buttons and place examples of both output files beside them.

## 11. Map controls

- `+`: zoom in
- `−`: zoom out
- Corners icon: center and fit every point
- Grid: helps users understand the map scale
- Lower-right scale: shows the estimated distance across one grid cell and changes with zoom
- Marker click: shows city, IP, and network details

Comparison and ranking lines only show locations. They do not show network hops or packet routes.

## 12. Clear and delete actions

- **Clear A/B selection** removes only A/B state and keeps every point.
- **Clear** in Activity Console removes only console entries.
- A row trash button opens confirmation for one point.
- **Delete all** opens confirmation for every point.

Confirming Delete all also clears A/B, `SRC`, the selected server, and the current Probe URL work.

> **Screenshot 13 — Delete confirmation:** Show the number of affected points, Cancel, and the delete button. Select Cancel after taking the screenshot so the sample list stays unchanged.

## 13. Activity Console

The Activity Console can show `[INFO]`, `[WAIT]`, `[OK]`, `[ERROR]`, and `[DEMO]` events. It only explains activity in the current browser session. It is not a permanent server log. You can open, close, or clear it without changing map data.

> **Screenshot 14 — Activity Console:** Show useful WAIT, OK, and ERROR lines. Hide any private or internal values.

## 14. Mobile screens and accessibility

- Narrow screens place the map first and stack the panels below it.
- Buttons and other controls have screen-reader labels and tooltips.
- Tab moves keyboard focus through controls.
- Enter submits the add-IP form.
- Escape closes an idle dialog.
- Keyboard focus stays inside an open window until it closes.
- The app follows the device setting for reduced motion.

Take at least one screenshot on a mobile screen. Check English and Thai, and both Light and Dark themes, before you make the final guide.

## 15. Short text for screenshots

- **Overview:** Compare IP locations and rank server candidates in one workspace.
- **Add IP:** Add a public IP, IPv6 address, or hostname. IP2Location provides the location data.
- **CSV:** Review headers, column roles, and exact invalid rows before lookup.
- **Import mode:** Add results to the current list, or safely replace the list with successful results.
- **Compare:** Select A and B to compare their location and network data side by side.
- **Ranking:** Choose `SRC`, then check each server's score and details.
- **HTTP:** Measure an HTTPS endpoint three times and use the successful median.
- **Map:** The grid and distance scale change with zoom.
- **Delete:** Clearing a selection does not delete IPs. The app asks before it deletes data.
- **Accuracy:** IP geolocation is approximate, and map lines are not traceroute paths.

## 16. Limits to explain clearly

- IP geolocation is approximate and is not GPS.
- Anycast/CDN targets may resolve differently.
- Direct map distance is not the length of the network path.
- Browser timing can include DNS, connection, TLS, server work, and browser scheduling.
- Scores help users compare servers. They are not service promises or automatic routing decisions.
- The working list and measurements reset when the page reloads.
