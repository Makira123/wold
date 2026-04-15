const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // 🔥 สำคัญมาก
app.use(express.json());

app.use(express.static(__dirname));

const path = require("path");

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

let data = {};

app.post("/api/message", (req, res) => {
  console.log("🔥 SERVER GOT:", req.body);

  const { user, text, channelId, images, videos } = req.body;

  if (!data[channelId]) data[channelId] = [];

  data[channelId].push({
    user,
    text,
    images: images || [],
    videos: videos || []
  });

  res.sendStatus(200);
});

app.get("/messages/:channelId", (req, res) => {
  res.json(data[req.params.channelId] || []);
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
