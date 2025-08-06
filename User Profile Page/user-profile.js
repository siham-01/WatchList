const apiKey = 'e6b5abf09b3886e139965f0bdba31cd9';
const apiUrl = `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`;


async function fetchAndDisplayMovies() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    const movies = data.results.slice(0, 7); 

    displayMovies('watchlistMovies', movies);
    displayMovies('watchedMovies', movies.reverse());
  } catch (error) {
    console.error('Failed to fetch movies:', error);
  }
}

function displayMovies(containerId, movies) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  movies.forEach(movie => {
    const posterPath = `https://image.tmdb.org/t/p/w200${movie.poster_path}`;

    const card = document.createElement('div');
    card.className = 'card mx-3';
    card.style.width = '10rem';

    card.innerHTML = `
      <img src="${posterPath}" class="card-img-top" alt="${movie.title}">
      <div class="card-body p-2">
        <h6 class="card-title text-truncate mb-0" title="${movie.title}">${movie.title}</h6>
      </div>
    `;

    container.appendChild(card);
  });
}

fetchAndDisplayMovies();