# Changelog

## Unreleased

- Kept Compare/Ranking in the desktop top bar and reworked Quick navigation as a collapsible far-left icon rail: compact mode shows five distinct section icons, while expanded mode reveals their text labels. Medium and mobile layouts retain suitable top-bar and vertical-panel variants.
- Reordered the single left panel so current-IP detection, live refresh, IP addition/import, and point selection appear before the optional demo controls; updated the English and Thai documentation to match.
- Fixed the 360–390 px header overflow with compact mobile branding, 44 px controls and a single theme-cycle button.
- Mobile demo runs now reveal and focus the recommended-server result instead of leaving it several screens below the IP list.
- Added accessible modal semantics, initial/return focus, Tab containment and Escape dismissal for Help and bulk import.
- Removed the programmatically triggered file input from keyboard navigation and added a focused usability check, bringing the suite to 45 passing tests.
- Optically aligned accuracy-note icons, enlarged numeric map-marker labels, and added localized tooltips/accessibility names to icon-only controls and map markers.
- Prevented map tooltips from collapsing to one-character columns when long network names wrap.
- Added an EN/TH import review UI with live row counts and explicit “keep current list” or “replace current list” choices; replacement is guarded so total lookup failure never erases the existing list.
- Replaced font-dependent button glyphs with centered SVG icons, enlarged modal/header/add/import/export/console controls, and standardized icon-only buttons at a minimum 44 px target with accessible labels and tooltips.

## 1.8.0 — 2026-09-08

- Added Netlify code-based per-IP/domain rate limits to both quota-consuming functions: 60 lookups and 20 current-IP requests per 60 seconds.
- Added a bounded 15-minute warm-instance cache for successful IP2Location results to reduce repeated upstream quota use.
- Added clear browser handling for platform `429` responses without assuming the response body is JSON.
- Fixed the Activity Console time test so it passes in whole-hour, half-hour and 45-minute time zones without changing local-time display behavior.
- Added three focused quota-protection tests, bringing the suite to 44 passing tests.
- Added GitHub Actions CI, a Windows contest-readiness checker, submission copy and an updated validation/release checklist.
- Confirmed a successful production build. Live API, deployed rate limits, browser layout, repository publication and public-demo checks remain release-owner tasks.

## 1.7.0 — 2026-09-04

- Added a read-only, in-page Activity Console for browser actions including lookup, refresh, bulk import, current-IP detection, A/B selection, deletion, HTTP measurement and export.
- The Sakura-dark console opens by default, auto-scrolls, caps the session at 200 entries, follows EN/TH and supports clear/collapse controls. Its layout moves below the map on smaller screens.
- API keys and probe URLs are never intentionally logged; key/token-like values in displayed details are redacted. Server-side API stages remain in the server terminal.
- Added four console-focused tests (41 total), including secret filtering, full IPv6 preservation, SSR markup, responsive CSS and action wiring.

## 1.6.3 — 2026-09-04

- Renamed the first launcher to “Try Demo — Simulated Data” and the second to “Load Live Test Example,” with matching Thai labels.
- Added visible, accessible notes explaining no-key simulated data versus API-backed lookup and manually started HTTP measurement. Moved “nearest ≠ fastest” into the demo explanation.
- Preserved button behavior and styling; updated the demo guide and existing translation/launcher checks. All 37 tests and the production build pass; browser QA remains blocked.

## 1.6.2 — 2026-09-04

- Displayed complete, readable IPv4/IPv6 addresses with wrapping across lists, comparisons, ranking details and map tooltips.
- Replaced the native one-line reference-IP dropdown with a wrapping, keyboard-accessible picker.
- Added growing, soft-wrapped IP and probe-URL fields with Enter submission, font-load/width resizing and IME protection.
- Preserved canonical IP values, export data and duplicate detection; added three targeted CSS/markup/input tests (37 total). Browser pixel/interaction QA remains unverified.

## 1.6.1 — 2026-09-04

- Fixed duplicate IP points after a refresh makes two hostnames resolve to the same address.
- Canonicalized IPv6 identity across API responses, current-IP insertion, manual addition, bulk import and probe matching.
- Shared list reconciliation preserves the surviving point ID and remaps A/B and ranking selections; A/B cannot reference the same merged point twice.
- Preserved a configured probe with its hostname and timing. First configured probe wins on conflicting duplicates; live geography takes precedence over bundled samples.
- Added duplicate-update/merge notices and seven focused regression tests, including real page functions with mocked API responses. All 34 checks pass; visual and live-provider QA remain unverified.

## 1.6.0 — 2026-09-04

- Added Add current IP in both workspaces, with a live-only lookup, map insertion, A/reference selection and duplicate-safe updates.
- Added request-stage progress bars, elapsed time and loading spinner to local server output; non-interactive and hosted logs use stage lines. Failed requests retain their last completed stage.
- Added accessible in-page loading indicators and real completed/total progress for bulk imports and refreshes.
- Local detection distinguishes development-host egress from direct public client addresses; rejects private remote clients and untrusted forwarding headers. Hosted detection uses the Netlify connection header.
- Retained Sakura pink/white buttons, gray disabled states and readable Niramit type. Added 12 focused tests, bringing the total to 27.

## 1.5.3 — 2026-09-04

- Disabled buttons now use opaque light-gray backgrounds and dark-gray labels/icons in both themes.
- Disabled hover states no longer regain pink colors or shadows; enabled buttons retain their existing styling.
- Added a disabled-state CSS regression check; 15 automated tests total.

## 1.5.2 — 2026-09-04

- Changed text and icons on solid Sakura-pink buttons to white in light and dark themes, including Add, demo, submit, selected-language and selected-menu icon controls.
- Preserved the existing pink backgrounds, outlined-button labels and v1.5.1 typography.

## 1.5.1 — 2026-09-04

- Replaced compact distance labels such as 1.4k km with full grouped kilometre values in Compare and Server Ranking, with Thai unit labels.
- Raised comparison tables and primary controls to 16px, secondary details to 14px, and distance highlights to 32px at the default browser font size.
- Split IP and network names onto separate lines and allowed wrapping instead of ellipsis truncation.
- Improved table spacing, delete-button size and narrow-screen distance layout while retaining Niramit and the Sakura theme.
- Added distance-format regression coverage; 14 core tests total.

## 1.5.0 — 2026-09-04

- Separated geographic fit, browser HTTP measurement and synthetic HTTP simulation.
- Added per-candidate matching HTTPS probe URLs, three-request median timing, exact success counts, errors and timestamps.
- Kept CORS/opaque/network failures unranked instead of labelling servers offline or inventing latency.
- Added weighted score explanations and JSON/CSV exports with evidence origin and formula.
- Added a nearest-versus-fastest demo, live HTTPS import example, demo guide and release checklist.
- Improved probe/evidence typography and rejected missing/invalid API coordinates.
- Preserved API keys when launching demo mode; live launcher retains unrelated local settings.
- Added 13 focused automated tests for ranking, measurement, import, export and invalid upstream data.

## 1.4.0 — 2026-09-03

- Replaced the confusing Route Selector and fixed demo scenarios with Server Ranking.
- Both IP Compare and Server Ranking now use one shared, unrestricted IP list.
- Added source-IP selection and automatic ranking of every remaining point using transparent Geo fit scoring.
- Added large purpose-matched SVG menu icons for Compare and Server Ranking.
- Added three-worker bulk paste plus CSV/TXT import with deduplication and partial-failure handling.
- Ranking mode now draws every source-to-server line, numbered markers, the recommended server and detailed network metadata.
- Removed latency claims from ranking and clearly labelled the result as a geographic estimate.

## 1.3.1 — 2026-09-03

- Replaced the single EN/TH button with an accessible two-position sliding language control.
- Added a dedicated remove button to every IP row, including bundled sample IPs.
- Removed IPs disappear from the map and A/B comparison immediately and stay removed during later IP2Location refreshes.

## 1.3.0 — 2026-09-03

- Added an IP Compare workspace that marks every IP in the current list on the Leaflet map.
- Added point A/B selection from either map markers or list rows, with a highlighted connecting line.
- Added side-by-side comparison for distance, country, region/city, ISP, ASN, usage type and timezone.
- Added a three-worker refresh action that enriches the eight sample IPs through IP2Location while preserving bundled fallbacks.
- Added support for locating custom public IPs or hostnames and adding them directly to the comparison map.

## 1.2.0 — 2026-09-03

- Added a country and sample-IP selector with eight locations across Asia, Europe, North America, Oceania and South America.
- Live mode resolves the selected IP through IP2Location; demo and unavailable-API modes use bundled geographic fallbacks.

## 1.1.4 — 2026-09-03

- Increased the Niramit type scale across controls, scenarios, endpoint lists, metrics, rankings, dialogs and map legends.
- Slightly widened the desktop side panels so larger text remains readable without crowding.

## 1.1.3 — 2026-09-03

- Changed the complete interface typeface to Niramit.
- Enlarged the percentage score ring and locked it to a non-shrinking 1:1 circle.

## 1.1.2 — 2026-09-03

- Increased line boxes and reserved descender space throughout the interface.
- Fixed clipped tails on Latin letters such as p, q, y, g and j while retaining BIZ UDPGothic.

## 1.1.1 — 2026-09-03

- Removed the CARTO dark basemap that displayed an API-key watermark.
- Dark mode now renders OpenStreetMap tiles with a local dark visual filter and requires no additional map API key.

## 1.1.0 — 2026-09-03

- Changed the complete interface palette to Sakura pink in light and dark themes.
- Added direct live IP2Location testing to the normal Vite development server.
- Added one-click Windows launchers for live and demo modes.
- Rendered demo ranking immediately while the live current-IP lookup is pending.
- Reduced the live lookup timeout and kept automatic demo fallback.

## 1.0.0 — 2026-09-03

- First complete SakuraTH GeoIP2Route release.
- Continued current-IP mapping from SakuraTH GeoIP2Map.
- Added multi-endpoint map, route ranking and failover simulation.
- Added demo scenarios and custom endpoint lookup.
- Added English/Thai interface and light/dark/automatic themes.
- Added JSON and CSV exports.
- Moved IP2Location credentials to server-side Netlify Functions.
