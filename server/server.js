const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 🔥 เปิดไฟล์เว็บ (สำคัญ)
const path = require("path")

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 📦 เก็บข้อมูล
let data = {};

// 📥 รับจาก bot
app.post("/api/message", (req, res) => {
  const { user, text, channelId, images, videos } = req.body;

  if (!data[channelId]) {
    data[channelId] = [];
  }

  data[channelId].push({
    user,
    text,
    images: images || [],
    videos: videos || []
  });

  console.log("รับ:", user, text);

  res.sendStatus(200);
});

// 📤 ส่งให้เว็บ
app.get("/messages/:channelId", (req, res) => {
  res.json(data[req.params.channelId] || []);
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
