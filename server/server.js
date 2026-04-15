const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const http = require("http");
const server = http.createServer(app);

// ให้ใช้ไฟล์ในโฟลเดอร์เดียวกัน
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.use(express.json()); // สำคัญมาก

let data = {};

app.post("/api/message", (req, res) => {
  const { user, text, channelId } = req.body;

  if (!data[channelId]) {
    data[channelId] = [];
  }

  data[channelId].push({ user, text });

  console.log("รับข้อมูล:", user, text);

  res.sendStatus(200);
});

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
