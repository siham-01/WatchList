
const apiKey = 'e6b5abf09b3886e139965f0bdba31cd9';

const trendingURL = `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`
const comedyURL = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=35`;

const URLs = [trendingURL, comedyURL]

const cardDeck = document.querySelector(".card-deck");
const trending = document.querySelector("#trending");


async function fetchMovies(apiUrl) {
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

                trending.appendChild(carouselItem);

            }

            i++;
            const movieCard = createMovieCard(media);
            cardRow.appendChild(movieCard);
        });
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function createMovieCard(media) {
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
            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#${id}">
                Description
            </button>

            <div class="modal fade" id="${id}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                    <h1 class="modal-title fs-5" id="exampleModalLabel">Description</h1>
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

fetchMovies(URLs[0]);
