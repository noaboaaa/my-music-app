const apiUrl = "http://localhost:4000/artists";

async function fetchArtists() {
  const response = await fetch(apiUrl);
  return await response.json();
}

async function deleteArtist(artistId) {
  const response = await fetch(`${apiUrl}/${artistId}`, {
    method: "DELETE",
  });
  return response;
}

async function saveArtist(artist) {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(artist),
  });
  return response;
}

async function fetchArtistById(artistId) {
  return await (await fetch(`${apiUrl}/${artistId}`)).json();
}

async function updateArtist(artistId, updatedArtist) {
  const response = await fetch(`${apiUrl}/${artistId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedArtist),
  });
  return response;
}

export {
  fetchArtists,
  deleteArtist,
  saveArtist,
  fetchArtistById,
  updateArtist,
};
