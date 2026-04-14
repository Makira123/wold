const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// 🔥 test ก่อน
app.get("/", (req, res) => {
  console.log("มีคนเข้า / แล้ว");
  res.send("OK WORKING");
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
