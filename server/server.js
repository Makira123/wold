const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

require("./bot.js");

// ให้ใช้ไฟล์ในโฟลเดอร์เดียวกัน
app.use(express.static(__dirname));

const path = require("path")

app.get("/", (req, res) => {
  res.send("HELLO ROOT FILE");
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
