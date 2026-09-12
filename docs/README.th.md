# เอกสารโครงการ

[กลับไปที่ README ภาษาไทย](../README.th.md) | [English documentation](README.md)

โฟลเดอร์นี้รวมเอกสารทางเทคนิคและเอกสารสำหรับส่งประกวด SakuraTH GeoIP2Route เลือกอ่านตามงานที่ต้องการได้จากตารางนี้:

| เอกสาร | ใช้สำหรับ |
|---|---|
| [USER-GUIDE.th.md](USER-GUIDE.th.md) | คู่มือใช้งานทีละขั้นตอนพร้อมภาพหน้าจอ |
| [ALGORITHM.md](ALGORITHM.md) | สูตรคะแนน หลักฐานจากการวัด HTTP ข้อจำกัดการ Import และข้อจำกัดของระบบ |
| [SUBMISSION.md](SUBMISSION.md) | ชื่อโครงการ คำอธิบายสั้น Remarks และข้อความสำหรับแบบฟอร์มประกวด |
| [RELEASE-CHECKLIST.md](RELEASE-CHECKLIST.md) | รายการตรวจสอบก่อนเปิดใช้งานหรือส่งประกวด |
| [VALIDATION.md](VALIDATION.md) | สิ่งที่ตรวจแล้ว และสิ่งที่ยังต้องตรวจบนระบบจริง |
| [../CHANGELOG.md](../CHANGELOG.md) | ประวัติการเปลี่ยนแปลงแต่ละเวอร์ชัน |

## ลำดับอ่านแบบสั้นที่สุด

1. อ่าน [README ภาษาไทย](../README.th.md) เพื่อเข้าใจระบบและวิธีรัน
2. อ่าน [ALGORITHM.md](ALGORITHM.md) ก่อนอธิบายความหมายของคะแนน
3. ทำตาม [RELEASE-CHECKLIST.md](RELEASE-CHECKLIST.md) ก่อนเปิด Public Deployment
4. ใช้ข้อความที่ตรวจแล้วจาก [SUBMISSION.md](SUBMISSION.md) ในแบบฟอร์มประกวด
5. ดู [VALIDATION.md](VALIDATION.md) เพื่อแยกผล Automated Test ออกจากสิ่งที่ต้องตรวจบนระบบจริง

## ขอบเขตของโปรเจกต์

GeoIP2Route เปรียบเทียบข้อมูลตำแหน่ง IP และจัดอันดับเซิร์ฟเวอร์ ไม่ได้ทำ Traceroute, ICMP Ping, ค้นหาเส้นทาง Packet, Failover, Load Balancing หรือการวัดจาก Remote Agent ระยะทางบนแผนที่เป็นค่าประมาณ ส่วนเวลา HTTP เป็นสัญญาณแยกต่างหากที่วัดจากเบราว์เซอร์ที่เปิดแอป

## ข้อมูลสำคัญของ Release

- Release candidate: `v1.8.0`
- Node.js: `20.19+` หรือ `22.12+`
- Import ได้ไม่เกิน 200 รายการที่ไม่ซ้ำ และไฟล์ละไม่เกิน 1 MiB
- Browser Probe: GET 3 ครั้ง ใช้ค่ามัธยฐานของเวลาถึง Response Headers ที่สำเร็จ และ Timeout 4.5 วินาทีต่อครั้ง
- Automated Suite: 45 Tests และ Structural Smoke Check
- Netlify Function Limits: Lookup 60 ครั้ง/นาที และ Current IP 20 ครั้ง/นาที ต่อ IP/Domain

ควรรักษาตัวเลขเหล่านี้ให้ตรงกับ Implementation และอัปเดตหน้านี้เมื่อมี Release ใหม่
