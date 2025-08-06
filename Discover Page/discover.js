
const apiKey = 'e6b5abf09b3886e139965f0bdba31cd9';


const trendingURL = `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`;
const baseDiscoverURL = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=popularity.desc`;

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




            if (i % 3 == 0){
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

function createMovieCard(media, key) {
    const { title, backdrop_path, overview, release_date, id } = media;

    const movieCard = document.createElement("div");
    const formattedDate = new Date(release_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });


    movieCard.innerHTML = `
        <div class="card" >
          <img class="card-img-top" src="https://image.tmdb.org/t/p/w500/${backdrop_path}" alt="Card image cap">
          <div class="card-body">
            <h5 class="card-title">${title}</h5>
            <p class="card-text"> Release Date: ${formattedDate} </p>
            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modal${id}${key}">
                Description
            </button>

            <div class="modal fade" id="modal${id}${key}" tabindex="-1" aria-labelledby="label${id}${key}" >
                <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                    <h1 class="modal-title fs-5" id="label${id}${key}">Description</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body text-start">
                    ${overview}
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
    /*




    */
}

function createSection(title){
    let container = document.createElement("div");
    container.classList = "container text-center my-4"

    container.innerHTML = `

    <h3 class = "text-start">${title} Movies</h3>
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
