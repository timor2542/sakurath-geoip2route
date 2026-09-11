# A 90-second GeoIP2Route demo

## 0–20 seconds: the question

“IP geolocation shows where an address is associated with. But is the nearest server always the best candidate?”

Open the app. Choose EN or TH with the slider. The interface keeps IP Compare and Server Ranking on the same list. No fixed country menu limits the list.

## 20–50 seconds: show a changing recommendation

Press **Try Demo — Simulated Data**. Explain the **SIMULATED** label before quoting any number. Bangkok is the geographic reference; Singapore is nearby, while Tokyo has faster synthetic HTTP timing. Expand the two score contributions and explain why Tokyo wins the HTTP formula.

Switch the ranking basis to **Geographic fit** to see the location-based view. Ordinary sample points also remain in the shared list, so the geographic ranking considers those too. Select IP Compare and compare the synthetic Bangkok and Tokyo points if you want a focused pair.

Do not call this a live speed test or traceroute. The simulation exists to make the evidence distinction reproducible, without keys or unreliable stage Wi-Fi.

## 50–75 seconds: show the real workflow

With your server-side IP2Location key configured, load the live HTTPS example or import authorized endpoints with matching probe URLs. Select a candidate, then press Save & measure. Explain that measurements originate from this browser, not from the reference IP.

Show successful requests, measurement time, score contributions and an export. If a request fails, show the honest unavailable state; do not say the endpoint is offline.

## 75–90 seconds: what changed from GeoIP2Map

“GeoIP2Map showed a location. GeoIP2Route adds pairwise comparison, candidate ranking, transparent evidence and an exportable result. Geography is useful context, and browser HTTP is separate evidence.”

End with the project source and live demo only after you have actually published and tested them.

## Before recording

- Use only synthetic or public example IPs; avoid private account details and API keys.
- Record the real application, not a mockup, and retain the simulation label.
- Keep the geographic, measured and simulated states visibly distinct.
- A screenshot/GIF should be captured from a working release; do not add a placeholder image claiming it is live.
- If the hosted demo returns a rate-limit message, wait one minute rather than retrying repeatedly; confirm both rules in the Netlify deploy log before recording.

## ภาษาไทยสั้น ๆ

“โปรเจกต์นี้ไม่ได้บอกว่าประเทศใกล้ที่สุดจะเร็วที่สุดเสมอ เราแยกการเทียบตำแหน่ง IP ออกจากเวลา HTTP ที่เบราว์เซอร์วัดได้ แล้วอธิบายว่าคะแนนแต่ละส่วนทำให้ตัวเลือกไหนได้อันดับหนึ่ง โดยไม่เอาข้อมูลจำลองมาปนกับผลจริง”
