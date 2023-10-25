const express = require("express");
const json = express.json;
const fs = require("fs");

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const app = express();
const port = 4000;

app.use(json()); // This handles JSON parsing in the request body.

const dataPath = "./data.json";

// Read data from JSON file
function readData() {
  try {
    const data = fs.readFileSync(dataPath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading data:", err);
    return [];
  }
}

// Write data to JSON file
function writeData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// Get all artists
app.get("/artists", (req, res) => {
  const artists = readData();
  res.json(artists);
});

// Get artist by ID
app.get("/artists/:id", (req, res) => {
  const artists = readData();
  const artist = artists.find((a) => a.id == req.params.id);
  if (!artist) {
    res.status(404).json({ error: "Artist not found" });
    return;
  }
  res.json(artist);
});

// Create a new artist
app.post("/artists", (req, res) => {
  const artists = readData();
  const newArtist = req.body;
  newArtist.id = Date.now().toString();
  artists.push(newArtist);
  writeData(artists);
  res.status(201).json(newArtist);
});

// Update an artist by ID
app.put("/artists/:id", (req, res) => {
  const artists = readData();
  const updatedArtist = req.body;
  const index = artists.findIndex((a) => a.id == req.params.id);
  if (index == -1) {
    res.status(404).json({ error: "Artist not found" });
    return;
  }
  artists[index] = updatedArtist;
  writeData(artists);
  res.json(updatedArtist);
});

// Delete an artist by ID
app.delete("/artists/:id", (req, res) => {
  const artists = readData();
  const index = artists.findIndex((a) => a.id == req.params.id);
  if (index == -1) {
    res.status(404).json({ error: "Artist not found" });
    return;
  }
  artists.splice(index, 1);
  writeData(artists);
  res.sendStatus(204);
});

// Add to Favorites
app.put("/artists/favorite/:id", (req, res) => {
  const artists = readData();
  const artistId = req.params.id;
  const artist = artists.find((a) => a.id == artistId);
  if (!artist) {
    res.status(404).json({ error: "Artist not found" });
    return;
  }
  artist.favorite = true;
  writeData(artists);
  res.status(200).json(artist);
});

// Remove from Favorites
app.put("/artists/unfavorite/:id", (req, res) => {
  const artists = readData();
  const artistId = req.params.id;
  const artist = artists.find((a) => a.id == artistId);
  if (!artist) {
    res.status(404).json({ error: "Artist not found" });
    return;
  }
  artist.favorite = false;
  writeData(artists);
  res.status(200).json(artist);
});

// Handle 404 (Not Found) Errors:
app.use((req, res, next) => {
  res.status(404).send("Sorry, page not found!");
});

// Handle 500 (Internal Server Error) Errors:
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});


