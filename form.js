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
  ageGroup.addEventListener('change', function() {
    if (ageGroup.value) {
      document.getElementById('stepGender').classList.remove('d-none');
    }
  });

  gender.addEventListener('change', function() {
    if (gender.value) {
      document.getElementById('stepGenre').classList.remove('d-none');
    }
  });

  genreSelect.addEventListener('change', function() {
    if (genreSelect.value) {
      selectedGenre = genreSelect.value;
      document.getElementById('movieSelection').classList.remove('d-none');
      currentPage = 1;
      moviesContainer.innerHTML = '';
      fetchMovies();
    }
  });

  document.getElementById('loadMoreBtn').addEventListener('click', function() {
    currentPage++;
    fetchMovies();
  });

  document.getElementById('getRecommendationsBtn').addEventListener('click', getRecommendations);
});

// Reset everything
function resetForm() {
  ageGroup.value = '';
  gender.value = '';
  genreSelect.value = '';

  document.getElementById('stepGender').classList.add('d-none');
  document.getElementById('stepGenre').classList.add('d-none');
  document.getElementById('movieSelection').classList.add('d-none');
  document.getElementById('recommendationsSection').classList.add('d-none');

  moviesContainer.innerHTML = '';
  recommendationsContainer.innerHTML = '';
  currentPage = 1;
  userRatings = {};
  selectedGenre = '';
}

// Get movies from API
function fetchMovies() {
  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${selectedGenre}&page=${currentPage}&sort_by=popularity.desc`;

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.results && data.results.length > 0) {
        showMovies(data.results);
      } else {
        throw new Error('No movies found');
      }
    })
    .catch(error => {
      console.error('Error fetching movies:', error);
      moviesContainer.innerHTML = '<p class="text-center text-danger">Failed to load movies. Please try again.</p>';
    });
}

// Show movies on the page
function showMovies(movies) {
  if (movies.length === 0) {
    moviesContainer.innerHTML = '<p>No movies found for this genre.</p>';
    return;
  }

  movies.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'col mb-4';

    const poster = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : 'https://via.placeholder.com/500x750?text=No+Poster';

    // Get current rating for this movie (if any)
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

// Rate a movie
  // Save the rating
function rateMovie(movieId, rating, clickedButton) {
  userRatings[movieId] = rating;

  // Get all rating buttons for this movie
  const movieCard = clickedButton.closest('.card');
  const ratingButtons = movieCard.querySelectorAll('.btn-group button');

  // Reset all buttons to outline style & got it online
  ratingButtons.forEach(btn => {
    btn.classList.remove(
      'btn-danger', 'btn-warning', 'btn-primary', 'btn-success', 'btn-secondary'
    );

    // Add appropriate outline class based on button text
    const btnText = btn.textContent.trim();
    if (btnText === 'Awful') btn.classList.add('btn-outline-danger');
    else if (btnText === 'Meh') btn.classList.add('btn-outline-warning');
    else if (btnText === 'Good') btn.classList.add('btn-outline-primary');
    else if (btnText === 'Amazing') btn.classList.add('btn-outline-success');
    else if (btnText === "Didn't See It") btn.classList.add('btn-outline-secondary');
  });

  // Highlight the selected button
  switch(rating) {
    case 'awful': clickedButton.classList.replace('btn-outline-danger', 'btn-danger'); break;
    case 'meh': clickedButton.classList.replace('btn-outline-warning', 'btn-warning'); break;
    case 'good': clickedButton.classList.replace('btn-outline-primary', 'btn-primary'); break;
    case 'amazing': clickedButton.classList.replace('btn-outline-success', 'btn-success'); break;
    case 'notseen': clickedButton.classList.replace('btn-outline-secondary', 'btn-secondary'); break;
  }
}

// Get recommendations
function getRecommendations() {
  const likedMovies = [];

  // Find movies rated Good or Amazing (ignore "Didn't See It" and other ratings)
  for (const [id, rating] of Object.entries(userRatings)) {
    if (rating === 'good' || rating === 'amazing') {
      likedMovies.push(id);
    }
  }

  if (likedMovies.length === 0) {
    alert('Please rate at least one movie as "Good" or "Amazing"');
    return;
  }
  recommendationsContainer.innerHTML = `
    <div class="col-12 text-center py-3">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Finding recommendations based on your ratings...</p>
    </div>
  `;
  document.getElementById('recommendationsSection').classList.remove('d-none');

  // Get recommendations
  const recommendationPromises = likedMovies.slice(0, 3).map(movieId =>
    fetch(`https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=${API_KEY}`)
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch');
        return response.json();
      })
      .then(data => data.results || [])
      .catch(error => {
        console.error(`Error fetching recommendations for movie ${movieId}:`, error);
        return [];
      })
  );

  Promise.all(recommendationPromises)
    .then(results => {
      const allRecommendations = results.flatMap(data => data);
      if (allRecommendations.length === 0) {
        return fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`)
          .then(response => response.json())
          .then(data => data.results.slice(0, 6));
      }

      // Remove duplicates and filter out movies the user has already rated
      const uniqueRecommendations = allRecommendations.reduce((acc, current) => {
        const exists = acc.some(movie => movie.id === current.id);
        const alreadyRated = userRatings.hasOwnProperty(current.id);

        if (!exists && !alreadyRated) {
          acc.push(current);
        }
        return acc;
      }, []);
      return uniqueRecommendations
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        .slice(0, 6);
    })
    .then(finalRecommendations => {
      showRecommendations(finalRecommendations);
    })
    .catch(error => {
      console.error('Error getting recommendations:', error);
      recommendationsContainer.innerHTML = `
        <div class="col-12 text-center py-3 text-danger">
          Failed to load recommendations. Please check your internet connection and try again.
        </div>
      `;
    });
}

// Show recommendations
function showRecommendations(recommendations) {
  if (recommendations.length === 0) {
    recommendationsContainer.innerHTML = `
      <div class="col-12 text-center py-3 text-muted">
        No recommendations found based on your ratings.
      </div>
    `;
    return;
  }

  recommendationsContainer.innerHTML = '';

  recommendations.forEach(movie => {
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-lg-4';

    const poster = movie.poster_path
      ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
      : 'https://via.placeholder.com/300x450?text=No+Poster';

    // Check if movie is already in watchlist
    const storage = StorageManager.getStorage();
    const inWatchlist = storage.watchlist.some(m => m.id === movie.id);
    const inWatched = storage.watched.some(m => m.id === movie.id);

    let buttonHtml = '';
    if (inWatched) {
      buttonHtml = `
        <button class="btn btn-secondary mt-auto" disabled>
          <i class="fas fa-check me-1"></i> Already Watched
        </button>
      `;
    } else if (inWatchlist) {
      buttonHtml = `
        <button class="btn btn-primary mt-auto" disabled>
          <i class="fas fa-check me-1"></i> In Watchlist
        </button>
      `;
    } else {
      buttonHtml = `
        <button class="btn btn-success mt-auto"
          onclick="addToWatchlist(${movie.id}, '${movie.title.replace(/'/g, "\\'")}', '${movie.poster_path}')">
          <i class="fas fa-plus me-1"></i> Add to Watchlist
        </button>
      `;
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

// Add to watchlist
function addToWatchlist(movieId, title, posterPath) {
  const movie = {
    id: movieId,
    title: title,
    poster_path: posterPath,
    addedAt: new Date().toISOString()
  };

  if (StorageManager.addToWatchlist(movie)) {
    showToast(`"${title}" added to your watchlist!`);

    // Update button
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

  // Set toast content
  toastBody.textContent = message;

  // Set toast color based on type
  const toastHeader = toast.querySelector('.toast-header');
  toastHeader.className = `toast-header bg-${type} text-white`;

  // Show toast
  const bootstrapToast = new bootstrap.Toast(toast);
  bootstrapToast.show();
}