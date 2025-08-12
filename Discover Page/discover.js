
const apiKey = 'e6b5abf09b3886e139965f0bdba31cd9';


const trendingURL = `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`;
const baseDiscoverURL = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=popularity.desc`;
const genreURL = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`

const map = new Map();
map.set("Trending", trendingURL);
map.set("Action", `${baseDiscoverURL}&with_genres=28`);
map.set("Adventure", `${baseDiscoverURL}&with_genres=12`);
map.set("Animation", `${baseDiscoverURL}&with_genres=16`);
map.set("Comedy", `${baseDiscoverURL}&with_genres=35`);
map.set("Crime", `${baseDiscoverURL}&with_genres=80`);
map.set("Documentary", `${baseDiscoverURL}&with_genres=99`);
map.set("Drama", `${baseDiscoverURL}&with_genres=18`);
map.set("Family", `${baseDiscoverURL}&with_genres=10751`);
map.set("Fantasy", `${baseDiscoverURL}&with_genres=14`);
map.set("Horror", `${baseDiscoverURL}&with_genres=27`);
map.set("Mystery", `${baseDiscoverURL}&with_genres=9648`);
map.set("Romance", `${baseDiscoverURL}&with_genres=10749`);
map.set("Thriller", `${baseDiscoverURL}&with_genres=53`);
map.set("War", `${baseDiscoverURL}&with_genres=10752`);
map.set("Western", `${baseDiscoverURL}&with_genres=37`);







async function fetchMovies(apiUrl, section, key) {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        let i = 0;
        let carouselItem;
        let cardRow;

        data.results.forEach(media => {




            if (i % 5 == 0){
                carouselItem = document.createElement("div");
                if (i == 0){
                    carouselItem.classList = "carousel-item active";

                }
                else{
                    carouselItem.classList = "carousel-item";
                }

                cardRow = document.createElement("div");
                cardRow.classList = "d-flex justify-content-center gap-3";
                carouselItem.appendChild(cardRow);

                section.appendChild(carouselItem);

            }

            i++;
            const movieCard = createMovieCard(media, key);
            cardRow.appendChild(movieCard);
        });
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}


function getPopularityLabel(score) {
    if (score > 400) {
        return "🔥 Extremely Popular";
    } else if (score > 100) {
        return "⭐ Popular";
    } else {
        return "💤 Low Interest";
    }
}





function createMovieCard(media, key) {
    const { title, backdrop_path, overview, release_date, id, poster_path, vote_average, popularity} = media;

    const movieCard = document.createElement("div");
    const formattedDate = new Date(release_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const imgSrc = backdrop_path
      ? `https://image.tmdb.org/t/p/w500${backdrop_path}`
      : 'https://via.placeholder.com/500x750?text=No+Poster';


      const posterImg = poster_path
      ? `https://image.tmdb.org/t/p/w500${poster_path}`
      : 'https://via.placeholder.com/500x750?text=No+Poster';

    const roundedScore = Math.round(vote_average * 10) / 10;

    const safeOverview = overview?.trim() || "No description available.";













    movieCard.innerHTML = `
        <div class="card h-100 custom-card" >
          <img class="card-img-top" src="${posterImg}" alt="Card image cap">
          <div class="card-body">
            <h5 class="card-title">${title}</h5>

            <button type="button" class="btn btn-primary button-color" data-bs-toggle="modal" data-bs-target="#modal${id}${key}">
                Description
            </button>

            <div class="modal fade" id="modal${id}${key}" tabindex="-1" aria-labelledby="label${id}${key}" >
                <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                     <h5 class="card-title">${title}</h5>



                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body text-start">
                    <img class="card-img-top" src="${imgSrc}" alt="Card image cap" style="padding-bottom: 10px;">

                    <i class="fa-solid fa-file"></i>

                    ${safeOverview}

                    <hr>

                    <div class = "movie-info">

                        <span> <i class="fa-solid fa-star"></i>
                        Ratings: ${roundedScore} / 10

                        </span>

                        <span>
                        <i class="fa-solid fa-calendar-days"></i>
                        ${formattedDate}

                        </span>

                        <span>
                        ${getPopularityLabel(popularity)}

                        </span>



                    </div>

                    </div>
                    <div class="modal-footer">
                    </div>
                </div>
                </div>
            </div>
          </div>
        </div>
`
    return movieCard;

}






function createSection(title){
    let container = document.createElement("div");
    container.classList = "container text-center my-4 "

    container.innerHTML = `

    <h3 class = "text-start m-5">${title} Movies</h3>
    <div id="movies"></div>

    <div  class="card-deck"></div>
    <div id="carousel${title}" class="carousel slide" >
        <div id = "${title}" class="carousel-inner" >

        </div>


        <button class="carousel-control-prev" type="button" data-bs-target="#carousel${title}" data-bs-slide="prev" >
          <span class="carousel-control-prev-icon"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#carousel${title}" data-bs-slide="next">
          <span class="carousel-control-next-icon"></span>
          <span class="visually-hidden">Next</span>
        </button>

      </div>`

      document.body.appendChild(container);


}

for (const [key, value] of map.entries()) {
    createSection(key);
    const cardDeck = document.querySelector(".card-deck");
    const section = document.querySelector(`#${key}`);
    fetchMovies(value, section , key);


}

function createFooter(){
    let footer = document.createElement("footer");
    footer.classList = "bg-body-tertiary text-center text-lg-start"
    footer.innerHTML = `

    <div class="text-center p-3">
        © 2020 Copyright:
        <a class="text-body" href="index.html">Movie</a>
      </div>


    `

    document.body.appendChild(footer);

}

createFooter();
