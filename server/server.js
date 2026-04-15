const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(__dirname));

let data = {};

// 🔥 ดึงลิงก์จากข้อความ
function extractLinks(text) {
  if (!text) return [];
  return text.match(/(https?:\/\/[^\s]+)/g) || [];
}

// 📦 API bot ส่งมา
app.post("/api/message", (req, res) => {
  const { user, text, channelId, images = [], videos = [] } = req.body;

  if (!data[channelId]) data[channelId] = [];

  const msg = {
    user,
    text,
    images,
    videos,
    links: extractLinks(text)
  };

  data[channelId].push(msg);

  // 🔥 realtime ไปเว็บ
  io.emit("message", msg);

  res.sendStatus(200);
});

// 📦 โหลดย้อนหลัง
app.get("/messages/:id", (req, res) => {
  res.json(data[req.params.id] || []);
});

// 🌐 PORT Render
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running");
});
