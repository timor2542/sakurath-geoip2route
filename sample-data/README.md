# CSV examples

These files contain public IP examples from additional countries, grouped by region:

- [asia-pacific.csv](asia-pacific.csv)
- [europe.csv](europe.csv)
- [americas.csv](americas.csv)
- [africa-middle-east.csv](africa-middle-east.csv)
- [ip-list.csv](ip-list.csv) — original mixed list
- [endpoints.csv](endpoints.csv) — hostname and Probe URL example

Import any file from the app with **Import CSV**. The `ip` column is the required target column. Country, region, and city fields are reference metadata for the CSV preview; the app verifies live location with IP2Location during import. Anycast, ISP routing, and database updates can make the returned location differ from the labels in these examples.
