import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3333;

const DATA_PATH = path.join(__dirname, "data.json");

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "..", "public")));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.get("/", (req, res) => {
  res.send("Welcome ");
});

app.get("/artists", async (req, res) => {
  try {
    const data = await fs.readFile(DATA_PATH);
    const artists = JSON.parse(data);
    res.json(artists);
  } catch (error) {
    console.error("Error reading data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

let nextId = 1;

// Get Artist by ID Route
const getArtistByID = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await fs.readFile(DATA_PATH);
    const artists = JSON.parse(data);
    const artist = artists.find((a) => a.id === id);
    if (artist) {
      res.json(artist);
    } else {
      res.status(404).json({ error: "Artist not found" });
    }
  } catch (error) {
    console.error("Error reading data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const createArtist = async (req, res) => {
  const newArtist = req.body;
  newArtist.id = String(nextId).padStart(2, "0");
  nextId++;
  try {
    const data = await fs.readFile(DATA_PATH);
    const artists = JSON.parse(data);
    artists.push(newArtist);
    await fs.writeFile(DATA_PATH, JSON.stringify(artists));
    res.json(newArtist);
  } catch (error) {
    console.error("Error writing data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateArtist = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await fs.readFile(DATA_PATH);
    let artists = JSON.parse(data);
    const artistIndex = artists.findIndex((a) => a.id === id);
    if (artistIndex !== -1) {
      artists[artistIndex] = { ...artists[artistIndex], ...req.body };
      await fs.writeFile(DATA_PATH, JSON.stringify(artists));
      res.json(artists[artistIndex]);
    } else {
      res.status(404).json({ error: "Artist not found" });
    }
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteArtist = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await fs.readFile(DATA_PATH);
    let artists = JSON.parse(data);
    const updatedArtists = artists.filter((a) => a.id !== id);
    if (artists.length !== updatedArtists.length) {
      await fs.writeFile(DATA_PATH, JSON.stringify(updatedArtists));
      res.json(updatedArtists);
    } else {
      res.status(404).json({ error: "Artist not found" });
    }
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

app.get("/artists/:id", getArtistByID);
app.post("/artists", createArtist);
app.put("/artists/:id", updateArtist);
app.delete("/artists/:id", deleteArtist);
