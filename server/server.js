const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// 🔥 รัน Discord Bot
require("./bot.js");

// 📂 ให้ใช้ไฟล์ในโฟลเดอร์นี้
app.use(express.static(__dirname));

// 🌐 หน้าเว็บหลัก
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "discordwebp.html"));
});

// ▶️ เปิด server
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
