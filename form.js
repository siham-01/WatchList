const API_KEY = '2e2fca0fdb88faade568892395e72ce7';


// Get all the form elements we need
const ageGroup = document.getElementById('ageGroup');
const gender = document.getElementById('gender');
const genreSelect = document.getElementById('genreSelect');
const moviesContainer = document.getElementById('moviesContainer');
const recommendationsContainer = document.getElementById('recommendationsContainer');

// Variables to keep track of things
let currentPage = 1;
let userRatings = {};
let selectedGenre = '';

// When the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Clear everything when page loads
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

  // Hide all steps except age
  document.getElementById('stepGender').classList.add('d-none');
  document.getElementById('stepGenre').classList.add('d-none');
  document.getElementById('movieSelection').classList.add('d-none');
  document.getElementById('recommendationsSection').classList.add('d-none');

  // Clear containers
  moviesContainer.innerHTML = '';
  recommendationsContainer.innerHTML = '';

  // Reset variables
  currentPage = 1;
  userRatings = {};
  selectedGenre = '';
}

// Get movies from API
function fetchMovies() {
  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${selectedGenre}&page=${currentPage}&sort_by=popularity.desc`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      showMovies(data.results);
    })
    .catch(error => {
      console.error('Error:', error);
      moviesContainer.innerHTML = '<p>Failed to load movies. Please try again.</p>';
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

    card.innerHTML = `
      <div class="card h-100">
        <img src="${poster}" class="card-img-top" alt="${movie.title}">
        <div class="card-body">
          <h5 class="card-title">${movie.title}</h5>
          <p class="card-text">${movie.release_date ? movie.release_date.substring(0, 4) : ''}</p>
          <div class="btn-group">
            <button class="btn btn-sm ${userRatings[movie.id] === 'awful' ? 'btn-danger' : 'btn-outline-danger'}"
              onclick="rateMovie(${movie.id}, 'awful')">Awful</button>
            <button class="btn btn-sm ${userRatings[movie.id] === 'meh' ? 'btn-warning' : 'btn-outline-warning'}"
              onclick="rateMovie(${movie.id}, 'meh')">Meh</button>
            <button class="btn btn-sm ${userRatings[movie.id] === 'good' ? 'btn-primary' : 'btn-outline-primary'}"
              onclick="rateMovie(${movie.id}, 'good')">Good</button>
            <button class="btn btn-sm ${userRatings[movie.id] === 'amazing' ? 'btn-success' : 'btn-outline-success'}"
              onclick="rateMovie(${movie.id}, 'amazing')">Amazing</button>
          </div>
        </div>
      </div>
    `;

    moviesContainer.appendChild(card);
  });
}

// Rate a movie
function rateMovie(movieId, rating) {
  userRatings[movieId] = rating;

  // Find all buttons for this movie and update their appearance
  const buttons = document.querySelectorAll(`button[onclick="rateMovie(${movieId}, '${rating}')"]`);
  buttons.forEach(btn => {
    // Remove all active classes first
    btn.classList.remove('btn-danger', 'btn-warning', 'btn-primary', 'btn-success');

    // Add the appropriate active class
    switch(rating) {
      case 'awful': btn.classList.add('btn-danger'); break;
      case 'meh': btn.classList.add('btn-warning'); break;
      case 'good': btn.classList.add('btn-primary'); break;
      case 'amazing': btn.classList.add('btn-success'); break;
    }
  });
}

// Get recommendations
function getRecommendations() {
  const likedMovies = [];

  // Find movies rated Good or Amazing
  for (const [id, rating] of Object.entries(userRatings)) {
    if (rating === 'good' || rating === 'amazing') {
      likedMovies.push(id);
    }
  }

  if (likedMovies.length === 0) {
    alert('Please rate at least one movie as "Good" or "Amazing"');
    return;
  }

  recommendationsContainer.innerHTML = '<p>Loading recommendations...</p>';
  document.getElementById('recommendationsSection').classList.remove('d-none');

  // Get recommendations for each liked movie
  likedMovies.forEach(movieId => {
    fetch(`https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=${API_KEY}`)
      .then(response => response.json())
      .then(data => {
        showRecommendations(data.results.slice(0, 3)); // Show top 3 recommendations
      })
      .catch(error => {
        console.error('Error:', error);
        recommendationsContainer.innerHTML = '<p>Failed to load recommendations.</p>';
      });
  });
}

// Show recommendations
function showRecommendations(recommendations) {
  if (recommendations.length === 0) {
    recommendationsContainer.innerHTML = '<p>No recommendations found.</p>';
    return;
  }

  recommendations.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'col mb-4';

    const poster = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : 'https://via.placeholder.com/500x750?text=No+Poster';

    card.innerHTML = `
      <div class="card h-100">
        <img src="${poster}" class="card-img-top" alt="${movie.title}">
        <div class="card-body">
          <h5 class="card-title">${movie.title}</h5>
          <p class="card-text">${movie.overview ? movie.overview.substring(0, 100) + '...' : ''}</p>
          <button class="btn btn-sm btn-success" onclick="addToWatchlist(${movie.id}, '${movie.title.replace(/'/g, "\\'")}')">
            Add to Watchlist
          </button>
        </div>
      </div>
    `;

    recommendationsContainer.appendChild(card);
  });
}

// Add to watchlist
function addToWatchlist(movieId, title) {
  alert(`"${title}" added to your watchlist!`);
}