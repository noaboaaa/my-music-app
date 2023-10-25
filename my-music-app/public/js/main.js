document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = "http://localhost:4000/artists";

  // Function to fetch and display artists
  async function fetchAndDisplayArtists() {
    const response = await fetch(apiUrl);
    const artists = await response.json();

    const artistsContainer = document.getElementById("artists");
    const favoritesContainer = document.getElementById("favorites");

    artistsContainer.innerHTML = ""; // Clear previous content
    favoritesContainer.innerHTML = ""; // Clear previous content

    if (artists.length === 0) {
      artistsContainer.innerHTML = "<p>No artists found.</p>";
      return;
    }

    artists.forEach((artist) => {
      const artistCard = document.createElement("div");
      artistCard.classList.add("artist-card");

      const artistInfo = document.createElement("div");
      artistInfo.classList.add("artist-info");

      artistInfo.innerHTML = `
        <h2>${artist.name}</h2>
        ${artist.genres ? `<p>Genres: ${artist.genres.join(", ")}</p>` : ""}
        <p>Active Since: ${artist.activeSince}</p>
        <p><a href="${artist.website}" target="_blank">Website</a></p>
      `;

      const artistButtons = document.createElement("div");
      artistButtons.classList.add("artist-buttons");

      const favoriteButtonText = artist.favorite
        ? "Remove from Favorites"
        : "Add to Favorites";

      artistButtons.innerHTML = `
        <button data-artist-id="${
          artist.id
        }" class="favorite-button">${favoriteButtonText}</button>
        <button data-artist-id="${
          artist.id
        }" class="delete-button">Delete</button>
        <button data-artist='${JSON.stringify(
          artist
        )}' class="edit-button">Edit</button>
      `;

      artistCard.appendChild(artistInfo);
      artistCard.appendChild(artistButtons);

      // Append the artist card to the appropriate section (artists or favorites)
      if (artist.favorite) {
        favoritesContainer.appendChild(artistCard);
      } else {
        artistsContainer.appendChild(artistCard);
      }
    });
  }

  // Function to delete an artist
  async function deleteArtist(artistId) {
    const response = await fetch(`${apiUrl}/${artistId}`, {
      method: "DELETE",
    });

    if (response.status === 204) {
      fetchAndDisplayArtists(); // Refresh the artist list
    } else {
      alert("Failed to delete artist.");
    }
  }

  const modal = document.getElementById("modal");
  const saveArtistButton = document.getElementById("save-artist");
  const favorites = document.getElementById("favorites");
  let editingArtistId = null;

  // Function to save an artist
  async function saveArtist() {
    const name = document.getElementById("name").value;
    const genres = document
      .getElementById("genres")
      .value.split(",")
      .map((genre) => genre.trim());
    const activeSince = document.getElementById("activeSince").value;
    const website = document.getElementById("website").value;

    const artist = { name, genres, activeSince, website };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(artist),
    });

    if (response.status === 201) {
      fetchAndDisplayArtists();
      closeModal();
      // Clear the form fields after saving
      document.getElementById("name").value = "";
      document.getElementById("genres").value = "";
      document.getElementById("activeSince").value = "";
      document.getElementById("website").value = "";
    } else {
      alert("Failed to create artist.");
    }
  }

  saveArtistButton.addEventListener("click", saveArtist);

  // Function to open the modal for editing an artist
  function openEditModal(artist = {}) {
    const nameInput = document.getElementById("name");
    const genresInput = document.getElementById("genres");
    const activeSinceInput = document.getElementById("activeSince");
    const websiteInput = document.getElementById("website");
    const modal = document.getElementById("modal");
    const updateArtistButton = document.getElementById("update-artist");
    const cancelEditButton = document.getElementById("cancel-edit");

    if (nameInput && genresInput && activeSinceInput && websiteInput && modal) {
      nameInput.value = artist.name || "";
      genresInput.value = artist.genres?.join(", ") || "";
      activeSinceInput.value = artist.activeSince || "";
      websiteInput.value = artist.website || "";

      if (artist.id) {
        // If we are editing an artist, store the artist's ID in the modal for later reference
        modal.dataset.artistId = artist.id;
      } else {
        // If we are adding a new artist, remove any previously stored artist ID from the modal
        delete modal.dataset.artistId;
      }

      // Display the modal and show the editing buttons
      modal.classList.remove("hidden");
      updateArtistButton.classList.remove("hidden");
      cancelEditButton.classList.remove("hidden");
    } else {
      alert("Some elements are missing. Cannot open the modal.");
    }
  }

  // Function to cancel the artist edit
  function cancelEdit() {
    const modal = document.getElementById("modal");
    const updateArtistButton = document.getElementById("update-artist");
    const cancelEditButton = document.getElementById("cancel-edit");

    // Clear any stored artist ID and hide the editing buttons
    delete modal.dataset.artistId;
    updateArtistButton.classList.add("hidden");
    cancelEditButton.classList.add("hidden");

    // Close the modal
    modal.classList.add("hidden");
  }

  // Event listener for opening the edit modal
  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("edit-button")) {
      const artistData = JSON.parse(event.target.dataset.artist);
      openEditModal(artistData);
    }
  });

  // Event listener for canceling artist edit
  document.getElementById("cancel-edit").addEventListener("click", cancelEdit);

  // Function to mark an artist as favorite
  async function markAsFavorite(artistId) {
    const artist = await (await fetch(`${apiUrl}/${artistId}`)).json();
    artist.favorite = true; // Set favorite to true
    const response = await fetch(`${apiUrl}/${artistId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(artist),
    });

    if (response.status === 200) {
      fetchAndDisplayArtists();
      fetchFavoriteArtists();
    } else {
      alert("Failed to mark as favorite.");
    }
  }

  // Function to unmark an artist as favorite
  async function unmarkAsFavorite(artistId) {
    const artist = await (await fetch(`${apiUrl}/${artistId}`)).json();
    artist.favorite = false; // Set favorite to false
    const response = await fetch(`${apiUrl}/${artistId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(artist),
    });

    if (response.status === 200) {
      fetchAndDisplayArtists();
      fetchFavoriteArtists();
    } else {
      alert("Failed to unmark as favorite.");
    }
  }
  // Function to toggle the favorite status of an artist
  async function toggleFavorite(artistId) {
    const artist = await (await fetch(`${apiUrl}/${artistId}`)).json();

    // Check the current favorite status and call the appropriate function
    if (artist.favorite) {
      unmarkAsFavorite(artistId); // If it's a favorite, unmark it
    } else {
      markAsFavorite(artistId); // If it's not a favorite, mark it
    }
  }
  // Add event listeners to the favorite buttons (Add to Favorites/Remove from Favorites)
  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("favorite-button")) {
      const artistId = event.target.dataset.artistId;
      toggleFavorite(artistId);
    }

    if (event.target.classList.contains("delete-button")) {
      const artistId = event.target.dataset.artistId;
      deleteArtist(artistId);
    }

    if (event.target.classList.contains("edit-button")) {
      const artistData = JSON.parse(event.target.dataset.artist);
      openModal(artistData);
    }
  });

  // Function to fetch and display favorite artists
  async function fetchFavoriteArtists() {
    const response = await fetch(`${apiUrl}?favorite=true`);
    const favoriteArtists = await response.json();

    favorites.innerHTML = ""; // Clear previous content

    if (favoriteArtists.length === 0) {
      favorites.innerHTML = "<p>No favorite artists found.</p>";
      return;
    }

    favoriteArtists.forEach((artist) => {
      const favoriteDiv = document.createElement("div");
      favoriteDiv.classList.add("artist-card", "favorite");

      favoriteDiv.innerHTML = `
        <h2>${artist.name}</h2>
        ${artist.genres ? `<p>Genres: ${artist.genres.join(", ")}</p>` : ""}
        <p>Active Since: ${artist.activeSince}</p>
        <p><a href="${artist.website}" target="_blank">Website</a></p>
        <button data-artist-id="${
          artist.id
        }" class="favorite-button">Unmark as Favorite</button>
      `;

      favorites.appendChild(favoriteDiv);
    });
  }

  // Initial fetch and display
  fetchAndDisplayArtists();
  fetchFavoriteArtists();
});








