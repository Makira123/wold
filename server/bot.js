const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const cors = require("cors");

const app = express();
app.use(cors());

// 🔴 ใส่ TOKEN
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.login(process.env.TOKEN);

// 📦 เก็บข้อมูล (แยกตามห้อง)
let data = {};

// 📥 รับข้อความ + รูปจาก Discord
client.on("messageCreate", (message) => {
  const channelId = message.channel.id;
  console.log("ห้อง:", message.channel.id);
  console.log("ชื่อห้อง:", message.channel.name);
  console.log("ข้อความ:", message.content);

  // สร้างห้องถ้ายังไม่มี
  if (!data[channelId]) {
    data[channelId] = [];
  }

  let msgData = {
    user: message.author.username,
    text: message.content,
    images: []
  };

  // ถ้ามีรูป
  if (message.attachments.size > 0) {
    message.attachments.forEach(att => {
      msgData.images.push(att.url);
    });
  }

  data[channelId].push(msgData);

  console.log("บันทึก:", msgData);
});

client.on("ready", async () => {
  console.log("กำลังโหลดทุกห้อง...");

  const channels = client.channels.cache;

  for (const [id, channel] of channels) {
    // เอาเฉพาะห้องข้อความ
    if (!channel.isTextBased()) continue;

    try {
      const messages = await channel.messages.fetch({ limit: 50 });

      messages.forEach(message => {
        const channelId = message.channel.id;

        if (!data[channelId]) {
          data[channelId] = [];
        }

        let msgData = {
          user: message.author.username,
          text: message.content,
          images: [],
          videos: []
        };

        message.attachments.forEach(att => {
          if (att.contentType && att.contentType.startsWith("image")) {
            msgData.images.push(att.url);
          } else if (att.contentType && att.contentType.startsWith("video")) {
            msgData.videos.push(att.url);
          }
        });

        data[channelId].push(msgData);
      });

      console.log("โหลดห้อง:", channel.name);
    } catch (err) {
      console.log("ข้ามห้อง:", channel.name);
    }
  }

  console.log("โหลดทุกห้องเสร็จแล้ว!");
});

// 🌐 API: ดึงข้อความตามห้อง
app.get("/messages/:channelId", (req, res) => {
  const id = req.params.channelId;
  res.json(data[id] || []);
});

// ▶️ เปิด server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});