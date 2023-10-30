// APP INITIALIZATION 
const apiEndpoint = "http://localhost:3333";
let selectedArtist;
let favorites = [];

window.addEventListener("load", initializeApp);

async function initializeApp() {
  const allArtists = await fetchArtists();
  updateArtistsGrid(allArtists);

  // Event Listeners
  document
    .querySelector("#addArtistForm")
    .addEventListener("submit", createNewArtist);
  document
    .querySelector("#form-update")
    .addEventListener("submit", updateExistingArtist);
  document
    .querySelector("#genreFilter")
    .addEventListener("change", () => filterByGenre(allArtists));
  document
    .querySelector("#sortBy")
    .addEventListener("change", () => sortArtistsByActive(allArtists));
  document
    .querySelector("#allArtists")
    .addEventListener("click", () => showAllArtists(allArtists));
  document
    .querySelector("#favoritedArtists")
    .addEventListener("click", () => displayArtists(favorites));
}

//READ ARTISTS
async function updateArtistsGrid() {
  const artists = await fetchArtists();
  displayArtists(artists);
}

async function fetchArtists() {
  const response = await fetch(`${apiEndpoint}/artists`);
  const data = await response.json();
  console.log(data);
  return data;
}

function displayArtists(artistList) {
  if (!Array.isArray(artistList)) {
    console.error("Expected an array, but got:", artistList);
    return;
  }
  document.querySelector("#artists-grid").innerHTML = "";

  for (const artist of artistList) {
    document.querySelector("#artists-grid").insertAdjacentHTML(
      "beforeend",
      `
      <article>
        <img src="${artist.image}" alt="${artist.name}">
        <h2>${artist.name}</h2>
        <p>Born: ${artist.birthdate}</p>
        <p>Active since: ${artist.activeSince}</p>
        <p>Genres: ${artist.genres}</p>
        <p>Labels: ${artist.labels}</p>
        <p>Website: <a href="${artist.website}" target="_blank">${artist.website}</a></p>
        <p>${artist.shortDescription}</p>
        <div class="buttons">
          <button class="btn-update-artist">Update</button>
          <button class="btn-delete-artist">Delete</button>
          <button class="btn-favorite-artist">Favorite</button>
        </div>
      </article>
      `
    );
    document
      .querySelector("#artists-grid article:last-child .btn-delete-artist")
      .addEventListener("click", () => deleteArtist(artist.id));
    document
      .querySelector("#artists-grid article:last-child .btn-update-artist")
      .addEventListener("click", () => selectArtist(artist));
    document
      .querySelector("#artists-grid article:last-child .btn-favorite-artist")
      .addEventListener("click", () => addToFavorites(artist));
  }
}

function displayFavoriteArtists(artistList) {
  const favoritesContainer = document.querySelector("#favoriteList");
  favoritesContainer.innerHTML = ""; 

  for (const artist of artistList) {
    favoritesContainer.insertAdjacentHTML(
      "beforeend",
      `
      <article>
        <img src="${artist.image}" alt="${artist.name}">
        <h2>${artist.name}</h2>
        <p>Born: ${artist.birthdate}</p>
        <p>Active since: ${artist.activeSince}</p>
        <p>Genres: ${artist.genres}</p>
        <p>Labels: ${artist.labels}</p>
        <p>Website: <a href="${artist.website}" target="_blank">${artist.website}</a></p>
        <p>${artist.shortDescription}</p>
        <div class="buttons">
        </div>
      </article>
      `
    );
  }
}

//CREATE ARTIST 
async function createNewArtist(event) {
  event.preventDefault();
  const name = event.target.name.value;
  const birthdate = event.target.birthdate.value;
  const genres = event.target.genres.value;
  const image = event.target.image.value;
  const labels = event.target.labels.value;
  const activeSince = event.target.activeSince.value;
  const website = event.target.website.value;
  const shortDescription = event.target.shortDescription.value;

  const newArtistData = {
    name,
    birthdate,
    genres,
    image,
    labels,
    activeSince,
    website,
    shortDescription,
  };
  const artistAsJson = JSON.stringify(newArtistData);
  const response = await fetch(`${apiEndpoint}/artists`, {
    method: "POST",
    body: artistAsJson,
    headers: { "Content-Type": "application/json" },
  });

  if (response.ok) {
    updateArtistsGrid();
    scrollToTop();
  }
}

//UPDATE ARTIST 
function selectArtist(artist) {
  selectedArtist = artist;
  const form = document.querySelector("#form-update");

  form.querySelector("#updateName").value = artist.name;
  form.querySelector("#updateBirthdate").value = artist.birthdate;
  form.querySelector("#updateGenres").value = artist.genres;
  form.querySelector("#updateImage").value = artist.image;
  form.querySelector("#updateLabels").value = artist.labels;
  form.querySelector("#updateActiveSince").value = artist.activeSince;
  form.querySelector("#updateWebsite").value = artist.website;
  form.querySelector("#updateDescription").value = artist.shortDescription;


  const modal = document.querySelector("#updateArtistModal");
  modal.style.display = "block";

  const updateButton = modal.querySelector(".btn-update-artist");
  updateButton.addEventListener("click", function () {
    modal.style.display = "none";
  });
}

document.querySelector(".close-btn").addEventListener("click", function () {
  const modal = document.querySelector("#updateArtistModal");
  modal.style.display = "none";
});


async function updateExistingArtist(event) {
  event.preventDefault();
  const name = event.target.querySelector("#updateName").value;
  const birthdate = event.target.querySelector("#updateBirthdate").value;
  const genres = event.target.querySelector("#updateGenres").value;
  const image = event.target.querySelector("#updateImage").value;
  const labels = event.target.querySelector("#updateLabels").value;
  const activeSince = event.target.querySelector("#updateActiveSince").value;
  const website = event.target.querySelector("#updateWebsite").value;
  const shortDescription =
    event.target.querySelector("#updateDescription").value;

  const updatedArtistData = {
    name,
    birthdate,
    genres,
    image,
    labels,
    activeSince,
    website,
    shortDescription,
  };
  const artistAsJson = JSON.stringify(updatedArtistData);
  const response = await fetch(`${apiEndpoint}/artists/${selectedArtist.id}`, {
    method: "PUT",
    body: artistAsJson,
    headers: { "Content-Type": "application/json" },
  });

  if (response.ok) {
    updateArtistsGrid();
    scrollToTop();
  }
}

// DELETE ARTIST
async function deleteArtist(id) {
  const response = await fetch(`${apiEndpoint}/artists/${id}`, {
    method: "DELETE",
  });

  if (response.ok) {
    updateArtistsGrid();
  }
}

// FILTER & SORT ARTISTS 
function filterByGenre(artists) {
  const selectedGenre = document.querySelector("#genreFilter").value;
  if (selectedGenre === "all") {
    displayArtists(artists);
  } else {
    const filteredArtists = artists.filter((artist) =>
      artist.genres.toLowerCase().includes(selectedGenre.toLowerCase())
    );
    displayArtists(filteredArtists);
  }
}

function sortArtistsByActive(artists) {
  const selectedSort = document.querySelector("#sortBy").value;
  switch (selectedSort) {
    case "oldest":
      artists.sort((a, b) => a.activeSince - b.activeSince);
      displayArtists(artists);
      break;
    case "newest":
      artists.sort((a, b) => b.activeSince - a.activeSince);
      displayArtists(artists);
      break;
  }
}

//  FAVORITE ARTISTS 
function addToFavorites(artist) {
  if (!favorites.some((fav) => fav.id === artist.id)) {
    favorites.push(artist);
    alert("Artist added to favorites!");
    displayFavoriteArtists(favorites); 
  } else {
    alert("Artist is already in favorites!");
  }
}

// HELPER FUNCTION
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
