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

        if (data.results?.length) {
          data.results.forEach(movie => {
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
      : "placeholder.jpg"; // Your placeholder image

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
            : "placeholder.jpg";

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
                    <div>
                    <p>${overview || "No description available."}</p>
                    <div class="btn-group btn-group-sm d-flex flex-wrap mb-3" role="group" aria-label="Rating buttons">
                        <button class="btn btn-outline-danger")">Awful</button>
                        <button class="btn btn-outline-warning")">Meh</button>
                        <button class="btn btn-outline-primary")">Good</button>
                        <button class="btn btn-outline-success")">Amazing</button>
                    </div>
                    <button class="btn btn-primary w-100">Add to Watchlist</button>
                    </div>
                </div>
                </div>
            </div>
            </div>
        `;

        detailModalsContainer.insertAdjacentHTML('beforeend', modalHTML);
    }

});
