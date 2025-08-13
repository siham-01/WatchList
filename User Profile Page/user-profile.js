// const apiKey = 'e6b5abf09b3886e139965f0bdba31cd9';
// const apiUrl = `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`;

document.addEventListener('DOMContentLoaded', function() {
  displayWatchlist();
  displayWatchedMovies();

  document.querySelectorAll('.btn-light').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      alert('Feature to create new watchlists coming soon!');
    });
  });
});

async function displayWatchlist() {
  const watchlistContainer = document.getElementById('watchlistMovies');
  const detailModalsContainer = document.getElementById('watchlistModalsContainer') || createDetailModalsContainer();
  const storage = StorageManager.getStorage();

  watchlistContainer.innerHTML = '';
  detailModalsContainer.innerHTML = '';

  if (storage.watchlist.length === 0) {
    watchlistContainer.innerHTML = '<p class="text-muted">Your watchlist is empty.</p>';
    return;
  }

  for (const movie of storage.watchlist) {
    const posterPath = movie.poster_path
      ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
      : 'https://via.placeholder.com/200x300?text=No+Poster';

    const card = document.createElement('div');
    card.className = 'card m-2 d-flex flex-column';
    card.style.width = '10rem';

    card.innerHTML = `
      <img src="${posterPath}" class="card-img-top" alt="${movie.title}">
      <div class="card-body p-2 d-flex flex-column">
        <h6 class="card-title text-truncate mb-2" title="${movie.title}">
          ${movie.title}
        </h6>
        <button class="btn btn-primary mt-auto"
                data-bs-toggle="modal"
                data-bs-target="#watchlistMovieModal-${movie.id}">
          <i class="fas fa-plus me-1"></i> More
        </button>
      </div>
    `;

    watchlistContainer.appendChild(card);
    await createWatchlistModal(movie);
  }
}

function createDetailModalsContainer() {
  const container = document.createElement('div');
  container.id = 'watchlistModalsContainer';
  document.body.appendChild(container);
  return container;
}

// Create modal with API-fetched details
async function createWatchlistModal(movie) {
  const detailModalsContainer = document.getElementById('watchlistModalsContainer');
  const { id, title, release_date, poster_path } = movie;
  const posterUrl = poster_path
    ? `https://image.tmdb.org/t/p/w300${poster_path}`
    : 'https://via.placeholder.com/300x450?text=No+Poster';

  // Check if movie has been rated
  const storage = StorageManager.getStorage();
  const watchedMovie = storage.watched.find(m => m.id === id);
  const currentRating = watchedMovie?.userRating || '';

  // Fetch movie details from API
  let overview = 'Loading description...';
  let year = 'N/A';

  try {
    const API_KEY = "2e2fca0fdb88faade568892395e72ce7";
    const response = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`);
    const movieDetails = await response.json();
    overview = movieDetails.overview || 'No description available.';
    year = movieDetails.release_date ? movieDetails.release_date.substring(0,4) :
           (release_date ? release_date.substring(0,4) : 'N/A');
  } catch (error) {
    console.error('Error fetching movie details:', error);
    overview = 'No description available.';
    year = release_date ? release_date.substring(0,4) : 'N/A';
  }

  const modalHTML = `
    <div class="modal fade" id="watchlistMovieModal-${id}" tabindex="-1" aria-labelledby="watchlistMovieLabel-${id}" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="watchlistMovieLabel-${id}">${title} (${year})</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body d-flex">
            <img src="${posterUrl}" alt="${title} Poster" class="me-3" style="max-width: 150px; flex-shrink: 0;">
            <div class="flex-grow-1">
              <p>${overview}</p>

              ${watchedMovie ? `
                <div class="alert alert-success mb-3">
                  <i class="fas fa-check-circle me-2"></i>
                  Watched - Rated: ${currentRating ? currentRating.charAt(0).toUpperCase() + currentRating.slice(1) : 'No rating'}
                </div>
              ` : `
                <div class="mb-3">
                  <h6>Rate to mark as watched:</h6>
                  <div class="btn-group btn-group-sm d-flex flex-wrap" role="group">
                    <button class="btn btn-outline-danger" onclick="rateAndMarkWatched(${id}, 'awful')">Awful</button>
                    <button class="btn btn-outline-warning" onclick="rateAndMarkWatched(${id}, 'meh')">Meh</button>
                    <button class="btn btn-outline-primary" onclick="rateAndMarkWatched(${id}, 'good')">Good</button>
                    <button class="btn btn-outline-success" onclick="rateAndMarkWatched(${id}, 'amazing')">Amazing</button>
                  </div>
                </div>
              `}

              <div class="d-flex gap-2">
                <button class="btn btn-danger flex-grow-1" onclick="removeFromWatchlist(${id})">
                  <i class="fas fa-trash-alt me-1"></i> Remove
                </button>
                ${!watchedMovie ? `
                  <button class="btn btn-secondary flex-grow-1" onclick="markAsWatchedWithoutRating(${id})">
                    <i class="fas fa-eye me-1"></i> Watched (No Rating)
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  detailModalsContainer.insertAdjacentHTML('beforeend', modalHTML);
}

// Helper functions
function rateAndMarkWatched(movieId, rating) {
  if (StorageManager.markAsWatchedWithRating(movieId, rating)) {
    showToast(`Movie rated as ${rating.charAt(0).toUpperCase() + rating.slice(1)} and moved to watched!`);
    displayWatchlist();
    displayWatchedMovies();
  }
}

function markAsWatchedWithoutRating(movieId) {
  if (StorageManager.markAsWatched(movieId)) {
    showToast('Movie marked as watched!');
    displayWatchlist();
    displayWatchedMovies();
  }
}

function removeFromWatchlist(movieId) {
  if (StorageManager.removeFromWatchlist(movieId)) {
    showToast('Movie removed from watchlist!');
    displayWatchlist();
    displayWatchedMovies();
  }
}

// Display watched movies
function displayWatchedMovies() {
  const watchedContainer = document.getElementById('watchedMovies');
  const watched = StorageManager.getWatched();

  watchedContainer.innerHTML = '';

  if (watched.length === 0) {
    watchedContainer.innerHTML = '<p class="text-muted text-center">You haven\'t marked any movies as watched yet.</p>';
    return;
  }

  watched.forEach(movie => {
    const posterPath = movie.poster_path
      ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
      : 'https://via.placeholder.com/200x300?text=No+Poster';

    // Create rating badge
    let ratingBadge = '';
    if (movie.userRating) {
      let ratingClass = '';
      let ratingText = '';

      switch(movie.userRating) {
        case 'awful':
          ratingClass = 'bg-danger text-white';
          ratingText = 'Awful';
          break;
        case 'meh':
          ratingClass = 'bg-warning text-dark';
          ratingText = 'Meh';
          break;
        case 'good':
          ratingClass = 'bg-primary text-white';
          ratingText = 'Good';
          break;
        case 'amazing':
          ratingClass = 'bg-success text-white';
          ratingText = 'Amazing';
          break;
        default:
          ratingClass = 'bg-secondary text-white';
          ratingText = 'Watched';
      }

      ratingBadge = `
        <span class="badge ${ratingClass} position-absolute top-0 end-0 m-2" style="font-size: 0.7rem; z-index: 10;">
          ${ratingText}
        </span>
      `;
    } else {
      ratingBadge = `
        <span class="badge bg-secondary text-white position-absolute top-0 end-0 m-2" style="font-size: 0.7rem; z-index: 10;">
          ✓ Watched
        </span>
      `;
    }

    const card = document.createElement('div');
    card.className = 'card mx-3 mb-3 position-relative';
    card.style.width = '10rem';

    card.innerHTML = `
      ${ratingBadge}
      <img src="${posterPath}" class="card-img-top" alt="${movie.title}" style="height: 150px; object-fit: cover;">
      <div class="card-body p-2">
        <h6 class="card-title text-truncate mb-1" title="${movie.title}">${movie.title}</h6>
        <small class="text-muted d-block mb-2">
          ${movie.watchedAt ? new Date(movie.watchedAt).toLocaleDateString() : ''}
        </small>
        <div class="d-flex justify-content-center mt-2">
          <button class="btn btn-danger btn-sm remove-watched" data-movie-id="${movie.id}">
            <i class="fas fa-trash"></i> Remove
          </button>
        </div>
      </div>
    `;

    watchedContainer.appendChild(card);
  });

  // Add event listeners for remove buttons
  document.querySelectorAll('.remove-watched').forEach(btn => {
    btn.addEventListener('click', function() {
      const movieId = parseInt(this.getAttribute('data-movie-id'));
      const movie = watched.find(m => m.id === movieId);

      if (movie && confirm(`Are you sure you want to remove "${movie.title}" from your watched list?`)) {
        if (StorageManager.removeFromWatched(movieId)) {
          displayWatchedMovies();
          showToast(`"${movie.title}" removed from watched list!`, 'info');
        }
      }
    });
  });
}

// Toast notifications
function showToast(message, type = 'success') {
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
    toastContainer.style.zIndex = '11';
    document.body.appendChild(toastContainer);
  }

  const toastId = 'toast-' + Date.now();
  const toastHtml = `
    <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header bg-${type} text-white">
        <strong class="me-auto">${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">${message}</div>
    </div>
  `;

  toastContainer.insertAdjacentHTML('beforeend', toastHtml);

  const toastElement = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastElement);
  toast.show();
  toastElement.addEventListener('hidden.bs.toast', function() {
    toastElement.remove();
  });
}