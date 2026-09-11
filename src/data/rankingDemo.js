// Synthetic geography and HTTP timings: never presented as live IP2Location/probe data.
export const rankingDemo = [
  { id:'demo-th', ip:'192.0.2.1', city_name:'Bangkok', country_name:'Thailand', country_code:'TH', latitude:13.7563, longitude:100.5018, time_zone:'Asia/Bangkok', usage_type:'ISP' },
  { id:'demo-sg', ip:'192.0.2.2', city_name:'Singapore', country_name:'Singapore', country_code:'SG', latitude:1.3521, longitude:103.8198, time_zone:'Asia/Singapore', usage_type:'DCH', samples:[230,240,250] },
  { id:'demo-jp', ip:'192.0.2.3', city_name:'Tokyo', country_name:'Japan', country_code:'JP', latitude:35.6762, longitude:139.6503, time_zone:'Asia/Tokyo', usage_type:'DCH', samples:[60,65,70] },
  { id:'demo-de', ip:'192.0.2.4', city_name:'Frankfurt', country_name:'Germany', country_code:'DE', latitude:50.1109, longitude:8.6821, time_zone:'Europe/Berlin', usage_type:'DCH', samples:[165,180,195] }
].map(point => ({ ...point, source:'sample', demoGroup:true, isp:'Synthetic demo network', asn:'DEMO',
  measurement: point.samples ? { kind:'simulated', vantage:'simulated_bangkok_client', status:'measured', latency:point.samples[1], samples:point.samples, attempts:3, successful:3 } : undefined }))
