document.addEventListener("DOMContentLoaded", () => {
  const modalHtml = `
    <div class="modal fade" id="searchResultsModal" tabindex="-1" aria-labelledby="searchResultsLabel" aria-hidden="true">
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="searchResultsLabel">Search Results</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body d-flex flex-wrap" id="searchResultsModalBody">
            <!-- Movie cards go here -->
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const detailModalsContainer = document.createElement("div");
  document.body.appendChild(detailModalsContainer);

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const modalElement = document.getElementById("searchResultsModal");
  const modalBody = document.getElementById("searchResultsModalBody");
  const searchResultsModal = new bootstrap.Modal(modalElement);

  // Store movie data for button handlers
  window.searchMovieData = {};

  searchForm.addEventListener("submit", e => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) searchMovies(query);
  });

  function searchMovies(query) {
    const API_KEY = "2e2fca0fdb88faade568892395e72ce7";
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        modalBody.innerHTML = "";
        detailModalsContainer.innerHTML = "";
        window.searchMovieData = {};

        if (data.results?.length) {
          data.results.forEach(movie => {
            window.searchMovieData[movie.id] = movie;
            const card = createSearchCard(movie);
            modalBody.appendChild(card);
            createDetailModal(movie);
          });
        } else {
          modalBody.innerHTML = `<p>No movies found for "${query}"</p>`;
        }
        searchResultsModal.show();
      })
      .catch(err => {
        modalBody.innerHTML = `<p class="text-danger">Error fetching movies.</p>`;
        searchResultsModal.show();
        console.error(err);
      });
  }

  function createSearchCard(movie) {
    const posterPath = movie.poster_path
      ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
      : "https://via.placeholder.com/200x300?text=No+Poster";

    const card = document.createElement("div");
    card.className = "card m-2 d-flex flex-column";
    card.style.width = "10rem";

    card.innerHTML = `
      <img src="${posterPath}" class="card-img-top" alt="${movie.title}">
      <div class="card-body p-2 d-flex flex-column">
        <h6 class="card-title text-truncate mb-2" title="${movie.title}">
          ${movie.title}
        </h6>
        <button class="btn btn-primary mt-auto" data-bs-toggle="modal" data-bs-target="#movieDetailModal-${movie.id}">
          <i class="fas fa-plus me-1"></i> More
        </button>
      </div>
    `;

    return card;
  }

  function createDetailModal(movie) {
    const { id, title, overview, release_date, poster_path } = movie;
    const year = release_date ? release_date.substring(0,4) : "N/A";
    const posterUrl = poster_path
      ? `https://image.tmdb.org/t/p/w300${poster_path}`
      : "https://via.placeholder.com/300x450?text=No+Poster";

    // Check current status
    const storage = StorageManager.getStorage();
    const inWatchlist = storage.watchlist.some(m => m.id === id);
    const inWatched = storage.watched.some(m => m.id === id);
    const currentRating = storage.watched.find(m => m.id === id)?.userRating || '';

    const modalHTML = `
      <div class="modal fade" id="movieDetailModal-${id}" tabindex="-1" aria-labelledby="movieDetailLabel-${id}" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="movieDetailLabel-${id}">${title} (${year})</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body d-flex">
              <img src="${posterUrl}" alt="${title} Poster" class="me-3" style="max-width: 150px; flex-shrink: 0;">
              <div class="flex-grow-1">
                <p>${overview || "No description available."}</p>

                ${inWatched ? `
                  <div class="alert alert-success mb-3">
                    <i class="fas fa-check-circle me-2"></i>
                    Already watched - Rated: ${currentRating ? currentRating.charAt(0).toUpperCase() + currentRating.slice(1) : 'No rating'}
                  </div>
                ` : `
                  <div class="btn-group btn-group-sm d-flex flex-wrap mb-3" role="group" aria-label="Rating buttons">
                    <button class="btn btn-outline-danger" onclick="rateFromSearch(${id}, 'awful')">Awful</button>
                    <button class="btn btn-outline-warning" onclick="rateFromSearch(${id}, 'meh')">Meh</button>
                    <button class="btn btn-outline-primary" onclick="rateFromSearch(${id}, 'good')">Good</button>
                    <button class="btn btn-outline-success" onclick="rateFromSearch(${id}, 'amazing')">Amazing</button>
                    <button class="btn btn-outline-secondary" onclick="rateFromSearch(${id}, 'notseen')">Didn't See It</button>
                  </div>
                `}

                ${inWatchlist ?
                  `<button class="btn btn-success w-100" disabled><i class="fas fa-check me-1"></i> Already in Watchlist</button>` :
                  (inWatched ?
                    `<button class="btn btn-secondary w-100" disabled><i class="fas fa-eye me-1"></i> Already Watched</button>` :
                    `<button class="btn btn-primary w-100" onclick="addToWatchlistFromSearch(${id})">Add to Watchlist</button>`
                  )
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    detailModalsContainer.insertAdjacentHTML('beforeend', modalHTML);
  }

  window.addToWatchlistFromSearch = function(movieId) {
    const movie = window.searchMovieData[movieId];
    if (!movie) return;

    const watchlistMovie = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        overview: movie.overview,
        release_date: movie.release_date,
        addedAt: new Date().toISOString()
    };

    if (StorageManager.addToWatchlist(watchlistMovie)) {
        showToast(`"${movie.title}" added to watchlist!`);

        // Update the button immediately
        const modal = document.getElementById(`movieDetailModal-${movieId}`);
        if (modal) {
            const button = modal.querySelector('.btn-primary');
            if (button) {
                button.innerHTML = '<i class="fas fa-check me-1"></i> In Watchlist';
                button.className = 'btn btn-success w-100';
                button.disabled = true;
                button.onclick = null;
            }
        }

        if (typeof displayWatchlist === 'function') {
            displayWatchlist();
        }
    } else {
        showToast(`"${movie.title}" is already in your watchlist!`, 'warning');
    }
};

window.rateFromSearch = function(movieId, rating, buttonElement) {
  const movie = window.searchMovieData[movieId];
  if (!movie) return;

  const storage = StorageManager.getStorage();
  const inWatchlist = storage.watchlist.some(m => m.id === movieId);
  const movieTitle = movie.title;

  if (rating !== 'notseen') {
      const movieData = {
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          overview: movie.overview,
          release_date: movie.release_date,
          watchedAt: new Date().toISOString(),
          userRating: rating
      };

      if (inWatchlist) {
          if (StorageManager.removeFromWatchlist(movieId)) {
              StorageManager.addToWatched(movieData);
          }
      } else {
          StorageManager.addToWatched(movieData);
      }

      StorageManager.addRating(movieId, rating);

      showToast(`"${movieTitle}" ${inWatchlist ? 'moved to watched' : 'added to watched'} and rated as ${rating.charAt(0).toUpperCase() + rating.slice(1)}!`);
      const modal = document.getElementById(`movieDetailModal-${movieId}`);
      if (modal) {
          modal.querySelector('.modal-body > div').innerHTML = `
              <p>${movie.overview || "No description available."}</p>
              <div class="alert alert-success mb-3">
                  <i class="fas fa-check-circle me-2"></i>
                  Watched - Rated: ${rating.charAt(0).toUpperCase() + rating.slice(1)}
              </div>
              <button class="btn btn-secondary w-100" disabled>
                  <i class="fas fa-check me-1"></i> Watched
              </button>
          `;
      }
  } else {
      StorageManager.addRating(movieId, rating);
      showToast(`Noted that you haven't seen "${movieTitle}"`);
  }
  if (typeof displayWatchedMovies === 'function') {
      displayWatchedMovies();
  }
};

});