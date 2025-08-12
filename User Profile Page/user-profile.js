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

function displayWatchlist() {
  const watchlistContainer = document.getElementById('watchlistMovies');
  const watchlist = StorageManager.getWatchlist();

  watchlistContainer.innerHTML = '';

  if (watchlist.length === 0) {
    watchlistContainer.innerHTML = `
      <div class="col-12 text-muted">
        <p>Your watchlist is empty. Add movies from recommendations!</p>
      </div>
    `;
    return;
  }

  watchlist.forEach(movie => {
    const posterPath = movie.poster_path
      ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
      : 'https://via.placeholder.com/200x300?text=No+Poster';

    const card = document.createElement('div');
    card.className = 'card mx-3 mb-3 position-relative';
    card.style.width = '10rem';

    card.innerHTML = `
      <img src="${posterPath}" class="card-img-top" alt="${movie.title}">
      <div class="card-body p-2">
        <h6 class="card-title text-truncate mb-0" title="${movie.title}">${movie.title}</h6>
        <div class="d-flex justify-content-between mt-2">
          <button class="btn btn-success btn-sm mark-watched" data-movie-id="${movie.id}">
            <i class="fas fa-check"></i>
          </button>
          <button class="btn btn-danger btn-sm remove-watchlist" data-movie-id="${movie.id}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;

    watchlistContainer.appendChild(card);
  });

  document.querySelectorAll('.mark-watched').forEach(btn => {
    btn.addEventListener('click', function() {
      const movieId = parseInt(this.getAttribute('data-movie-id'));
      if (StorageManager.markAsWatched(movieId)) {
        displayWatchlist();
        displayWatchedMovies();
        showToast('Movie marked as watched!');
      }
    });
  });

  document.querySelectorAll('.remove-watchlist').forEach(btn => {
    btn.addEventListener('click', function() {
      const movieId = parseInt(this.getAttribute('data-movie-id'));
      StorageManager.removeFromWatchlist(movieId);
      displayWatchlist();
      showToast('Movie removed from watchlist!');
    });
  });
}

function displayWatchedMovies() {
  const watchedContainer = document.getElementById('watchedMovies');
  const watched = StorageManager.getWatched();

  watchedContainer.innerHTML = '';

  if (watched.length === 0) {
    watchedContainer.innerHTML = `
      <div class="col-12 text-muted">
        <p>You haven't marked any movies as watched yet.</p>
      </div>
    `;
    return;
  }

  watched.forEach(movie => {
    const posterPath = movie.poster_path
      ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
      : 'https://via.placeholder.com/200x300?text=No+Poster';

    const card = document.createElement('div');
    card.className = 'card mx-3 mb-3 position-relative';
    card.style.width = '10rem';

    card.innerHTML = `
      <img src="${posterPath}" class="card-img-top" alt="${movie.title}">
      <div class="card-body p-2">
        <h6 class="card-title text-truncate mb-0" title="${movie.title}">${movie.title}</h6>
        <div class="d-flex justify-content-center mt-2">
          <button class="btn btn-danger btn-sm remove-watched" data-movie-id="${movie.id}">
            <i class="fas fa-trash"></i> Remove
          </button>
        </div>
      </div>
    `;

    watchedContainer.appendChild(card);
  });
  document.querySelectorAll('.remove-watched').forEach(btn => {
    btn.addEventListener('click', function() {
      const movieId = parseInt(this.getAttribute('data-movie-id'));
      StorageManager.removeFromWatched(movieId);
      displayWatchedMovies();
      showToast('Movie removed from watched list!');
    });
  });
}

//bootstrap

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