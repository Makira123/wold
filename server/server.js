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
mongoose.connect("mongodb+srv://maki:makirajikan123@cluster0.p4kpyei.mongodb.net/mydb?retryWrites=true&w=majority", {
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.log("❌ MongoDB ERROR:", err.message));

mongoose.connection.on("error", err => {
  console.log("❌ CONNECTION ERROR:", err);
});

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

  try {
    const saved = await Message.create({
      user,
      text,
      channelId,
      images: images || [],
      videos: videos || []
    });

    console.log("✅ SAVED:", saved);

  } catch (err) {
    console.log("❌ SAVE ERROR:", err);
  }

  res.sendStatus(200);
});
// 📤 ส่งให้เว็บ
app.get("/messages/:channelId", async (req, res) => {
  const messages = await Message.find({
    channelId: req.params.channelId
  }).sort({ _id: -1 }).limit(50);

  res.json(messages);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
