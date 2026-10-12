// แสดงที่อยู่ที่เครื่องอื่นในวงเครือข่ายเดียวกันใช้เปิดระบบนี้ได้
import { networkInterfaces } from "node:os";

const port = Number(process.env.PORT) || 3400;
const found = [];
for (const [name, list] of Object.entries(networkInterfaces())) {
  for (const a of list ?? []) {
    if (a.family === "IPv4" && !a.internal) found.push({ name, address: a.address });
  }
}

if (found.length === 0) {
  console.log("ไม่พบที่อยู่ IPv4 ของเครือข่าย — ตรวจว่าเชื่อมต่อ Wi-Fi/LAN แล้ว");
  process.exit(1);
}

console.log("เครื่องอื่นในเครือข่ายเดียวกันเปิดระบบได้ที่:\n");
for (const { name, address } of found) {
  console.log(`  [${name}]`);
  console.log(`    หน้าแรก (QR)        : http://${address}:${port}/`);
  console.log(`    พนักงาน (แจ้งปัญหา) : http://${address}:${port}/chat`);
  console.log(`    ทีมไอที (ตอบแชท)   : http://${address}:${port}/admin`);
    console.log(`    ตัวอย่างหน้าไอที    : http://${address}:${port}/admin?demo=1   (เฉพาะโหมด dev)\n`);
}
console.log("หมายเหตุ: เปิดหน้าแรกผ่านที่อยู่นี้ QR จะชี้มาที่เครื่องนี้โดยอัตโนมัติ (มือถือต้องอยู่เครือข่ายเดียวกัน)");
