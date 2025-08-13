const API_KEY = '2e2fca0fdb88faade568892395e72ce7';
const ageGroup = document.getElementById('ageGroup');
const gender = document.getElementById('gender');
const genreSelect = document.getElementById('genreSelect');
const moviesContainer = document.getElementById('moviesContainer');
const recommendationsContainer = document.getElementById('recommendationsContainer');

let currentPage = 1;
let userRatings = {};
let selectedGenre = '';

document.addEventListener('DOMContentLoaded', function() {
  resetForm();

  // Set up event listeners
  ageGroup.addEventListener('change', () => {
    if (ageGroup.value) document.getElementById('stepGender').classList.remove('d-none');
  });

  gender.addEventListener('change', () => {
    if (gender.value) document.getElementById('stepGenre').classList.remove('d-none');
  });

  genreSelect.addEventListener('change', () => {
    if (genreSelect.value) {
      selectedGenre = genreSelect.value;
      document.getElementById('movieSelection').classList.remove('d-none');
      currentPage = 1;
      moviesContainer.innerHTML = '';
      fetchMovies();
    }
  });

  document.getElementById('loadMoreBtn').addEventListener('click', () => {
    currentPage++;
    fetchMovies();
  });

  document.getElementById('getRecommendationsBtn').addEventListener('click', getRecommendations);
});

function resetForm() {
  ageGroup.value = '';
  gender.value = '';
  genreSelect.value = '';

  ['stepGender', 'stepGenre', 'movieSelection', 'recommendationsSection'].forEach(id => {
    document.getElementById(id).classList.add('d-none');
  });

  moviesContainer.innerHTML = '';
  recommendationsContainer.innerHTML = '';
  currentPage = 1;
  userRatings = {};
  selectedGenre = '';
}

function fetchMovies() {
  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${selectedGenre}&page=${currentPage}&sort_by=popularity.desc`;

  fetch(url)
    .then(response => response.json())
    .then(data => showMovies(data.results))
    .catch(error => {
      console.error('Error fetching movies:', error);
      moviesContainer.innerHTML = '<p class="text-center text-danger">Failed to load movies. Please try again.</p>';
    });
}

function showMovies(movies) {
  movies.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'col mb-4';

    const poster = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : 'https://via.placeholder.com/500x750?text=No+Poster';

    const currentRating = userRatings[movie.id] || '';

    card.innerHTML = `
      <div class="card h-100">
        <img src="${poster}" class="card-img-top" alt="${movie.title}">
        <div class="card-body">
          <h5 class="card-title">${movie.title}</h5>
          <p class="card-text">${movie.release_date ? movie.release_date.substring(0, 4) : ''}</p>
          <div class="btn-group btn-group-sm d-flex flex-wrap">
            <button class="btn ${currentRating === 'awful' ? 'btn-danger' : 'btn-outline-danger'}"
              onclick="rateMovie(${movie.id}, 'awful', this)">Awful</button>
            <button class="btn ${currentRating === 'meh' ? 'btn-warning' : 'btn-outline-warning'}"
              onclick="rateMovie(${movie.id}, 'meh', this)">Meh</button>
            <button class="btn ${currentRating === 'good' ? 'btn-primary' : 'btn-outline-primary'}"
              onclick="rateMovie(${movie.id}, 'good', this)">Good</button>
            <button class="btn ${currentRating === 'amazing' ? 'btn-success' : 'btn-outline-success'}"
              onclick="rateMovie(${movie.id}, 'amazing', this)">Amazing</button>
            <button class="btn ${currentRating === 'notseen' ? 'btn-secondary' : 'btn-outline-secondary'}"
              onclick="rateMovie(${movie.id}, 'notseen', this)">Didn't See It</button>
          </div>
        </div>
      </div>
    `;

    moviesContainer.appendChild(card);
  });
}

function rateMovie(movieId, rating, clickedButton) {
  userRatings[movieId] = rating;

  // Check if in watchlist and move to watched if rated
  const storage = StorageManager.getStorage();
  const inWatchlist = storage.watchlist.some(m => m.id === movieId);
  const movieTitle = clickedButton.closest('.card').querySelector('.card-title').textContent;

  if (inWatchlist && rating !== 'notseen') {
    if (StorageManager.markAsWatchedWithRating(movieId, rating)) {
      showToast(`"${movieTitle}" moved to watched and rated as ${rating.charAt(0).toUpperCase() + rating.slice(1)}!`);
    }
  } else {
    StorageManager.addRating(movieId, rating);
    showToast(`"${movieTitle}" rated as ${rating.charAt(0).toUpperCase() + rating.slice(1)}!`);
  }

  // Update button styles
  const movieCard = clickedButton.closest('.card');
  const ratingButtons = movieCard.querySelectorAll('.btn-group button');

  ratingButtons.forEach(btn => {
    btn.className = btn.className.replace(/btn-(danger|warning|primary|success|secondary)(?!\w)/g, 'btn-outline-$1');
  });

  const ratingClasses = {
    'awful': 'btn-danger',
    'meh': 'btn-warning',
    'good': 'btn-primary',
    'amazing': 'btn-success',
    'notseen': 'btn-secondary'
  };

  clickedButton.className = clickedButton.className.replace(/btn-outline-\w+/, ratingClasses[rating]);
}

function getRecommendations() {
  const likedMovies = Object.entries(userRatings)
    .filter(([id, rating]) => rating === 'good' || rating === 'amazing')
    .map(([id]) => id);

  if (likedMovies.length === 0) {
    alert('Please rate at least one movie as "Good" or "Amazing"');
    return;
  }

  recommendationsContainer.innerHTML = `
    <div class="col-12 text-center py-3">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Finding recommendations...</p>
    </div>
  `;
  document.getElementById('recommendationsSection').classList.remove('d-none');

  const promises = likedMovies.slice(0, 3).map(movieId =>
    fetch(`https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=${API_KEY}`)
      .then(res => res.json())
      .then(data => data.results || [])
      .catch(() => [])
  );

  Promise.all(promises)
    .then(results => {
      let allRecs = results.flatMap(data => data);

      if (allRecs.length === 0) {
        return fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`)
          .then(res => res.json())
          .then(data => data.results.slice(0, 6));
      }

      // Remove duplicates and already rated movies
      const uniqueRecs = allRecs.filter((movie, index, arr) =>
        arr.findIndex(m => m.id === movie.id) === index &&
        !userRatings.hasOwnProperty(movie.id)
      );

      return uniqueRecs.sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 6);
    })
    .then(showRecommendations)
    .catch(error => {
      console.error('Error getting recommendations:', error);
      recommendationsContainer.innerHTML = '<div class="col-12 text-center py-3 text-danger">Failed to load recommendations.</div>';
    });
}

function showRecommendations(recommendations) {
  if (recommendations.length === 0) {
    recommendationsContainer.innerHTML = '<div class="col-12 text-center py-3 text-muted">No recommendations found.</div>';
    return;
  }

  recommendationsContainer.innerHTML = '';

  recommendations.forEach(movie => {
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-lg-4';

    const poster = movie.poster_path
      ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
      : 'https://via.placeholder.com/300x450?text=No+Poster';

    const storage = StorageManager.getStorage();
    const inWatchlist = storage.watchlist.some(m => m.id === movie.id);
    const inWatched = storage.watched.some(m => m.id === movie.id);

    let buttonHtml = '';
    if (inWatched) {
      const watchedMovie = storage.watched.find(m => m.id === movie.id);
      const ratingText = watchedMovie?.userRating ?
        `Rated: ${watchedMovie.userRating.charAt(0).toUpperCase() + watchedMovie.userRating.slice(1)}` :
        'Already Watched';
      buttonHtml = `<button class="btn btn-secondary mt-auto" disabled><i class="fas fa-check me-1"></i> ${ratingText}</button>`;
    } else if (inWatchlist) {
      buttonHtml = `<button class="btn btn-primary mt-auto" disabled><i class="fas fa-check me-1"></i> In Watchlist</button>`;
    } else {
      buttonHtml = `<button class="btn btn-success mt-auto" onclick="addToWatchlist(${movie.id}, '${movie.title.replace(/'/g, "\\'")}', '${movie.poster_path}')"><i class="fas fa-plus me-1"></i> Add to Watchlist</button>`;
    }

    col.innerHTML = `
      <div class="card h-100">
        <img src="${poster}" class="card-img-top" alt="${movie.title}" style="height: 300px; object-fit: cover;">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${movie.title}</h5>
          <p class="card-text small text-muted flex-grow-1">
            ${movie.overview ? movie.overview.substring(0, 120) + '...' : 'No description available.'}
          </p>
          ${buttonHtml}
        </div>
      </div>
    `;

    recommendationsContainer.appendChild(col);
  });
}

function addToWatchlist(movieId, title, posterPath) {
  const movie = {
    id: movieId,
    title: title,
    poster_path: posterPath,
    addedAt: new Date().toISOString()
  };

  if (StorageManager.addToWatchlist(movie)) {
    showToast(`"${title}" added to your watchlist!`);
    const button = event.target.closest('button');
    button.innerHTML = '<i class="fas fa-check me-1"></i> In Watchlist';
    button.className = 'btn btn-primary mt-auto';
    button.disabled = true;
  } else {
    showToast(`"${title}" is already in your watchlist!`, 'warning');
  }
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toastNotification');
  const toastBody = toast.querySelector('.toast-body');
  const toastHeader = toast.querySelector('.toast-header');

  toastBody.textContent = message;
  toastHeader.className = `toast-header bg-${type} text-white`;

  const bootstrapToast = new bootstrap.Toast(toast);
  bootstrapToast.show();
}