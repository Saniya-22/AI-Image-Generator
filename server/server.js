const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

require("dotenv").config();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
});

const imageSchema = new mongoose.Schema({
  url: String,
  prompt: String,
});

const Image = mongoose.model("Image", imageSchema);

app.get("/", async (req, res) => {
  res.send(`Server is running on ${PORT}`);
});

app.post("/saveImage", async (req, res) => {
  try {
    const { url, prompt } = req.body;
    const newImage = new Image({ url, prompt });
    await newImage.save();
    res.status(200).json({ message: "Image saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/getImages", async (req, res) => {
  try {
    const images = await Image.find();
    res.status(200).json(images);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
