const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// ให้ใช้ไฟล์ในโฟลเดอร์เดียวกัน
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
