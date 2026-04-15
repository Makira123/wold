const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose"); // 🔥 เพิ่ม

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(__dirname));

const path = require("path");

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 🔥 ใส่ URL MongoDB ของคุณตรงนี้
mongoose.connect("mongodb+srv://maki:<db_password>@cluster0.p4kpyei.mongodb.net/?appName=Cluster0")
.then(()=>console.log("✅ MongoDB connected"))
.catch(err=>console.log(err));

// 📦 schema
const Message = mongoose.model("Message", {
  user: String,
  text: String,
  channelId: String,
  images: [String],
  videos: [String]
});

// 📥 รับจาก bot
app.post("/api/message", async (req, res) => {
  console.log("🔥 SERVER GOT:", req.body);

  const { user, text, channelId, images, videos } = req.body;

  await Message.create({
    user,
    text,
    channelId,
    images: images || [],
    videos: videos || []
  });

  res.sendStatus(200);
});

// 📤 ส่งให้เว็บ
app.get("/messages/:channelId", async (req, res) => {
  const messages = await Message.find({
    channelId: req.params.channelId
  }).sort({ _id: -1 }).limit(50);

  res.json(messages);
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
