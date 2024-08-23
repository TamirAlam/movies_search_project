const formEl = document.querySelector("form");
const containerEl = document.querySelector(".image-container");

formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  let query = formEl.querySelector("input").value;

  if (!query) {
    alert('Please enter a search term');
    return;
  }

  fetchMovies(query);
});

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwODdjMjY0M2UwZmQ3ZWU4OWY4MDFkY2JiNGUwOGUxZSIsIm5iZiI6MTcyNDMxMzMzNi43Nzc0NTgsInN1YiI6IjY2YzZjYTlkYTQwMmFiY2IzOTU4NGQ2NyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.1AKAlSNIyAHPgeMb9fYqLrjcNyH-gAgDYGMfFXYOSjA'
  }
};

// Fetch movies based on the search query
function fetchMovies(query) {
  fetch(`https://api.themoviedb.org/3/search/movie?query=${query}&include_adult=false&language=en-US&page=1`, options)
    .then(response => response.json())
    .then(data => displayMovies(data.results))
    .catch(err => console.error('Error fetching data:', err));
}

// Display the list of movies
function displayMovies(movies) {
  containerEl.innerHTML = ''; 

  if (movies.length === 0) {
    containerEl.innerHTML = '<p>No results found.</p>';
    return;
  }

  movies.forEach(movie => {
    const movieEl = document.createElement('div');
    movieEl.classList.add('movie-card');

    const imageUrl = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : 'https://via.placeholder.com/200x300?text=No+Image';

    movieEl.innerHTML = `
      <img src="${imageUrl}" alt="${movie.title}">
      <div class="movie-title">${movie.title}</div>
      <div class="movie-rating">${movie.vote_average || 'N/A'}</div>
      <button class="details-btn">Show Details</button>
    `;
    movieEl.querySelector('.details-btn').addEventListener('click', () => {
      fetchMovieDetails(movie.id, movieEl);
    });

    containerEl.appendChild(movieEl);
  });
}
function fetchMovieDetails(movieId, movieCard) {
  
  fetch(`https://api.themoviedb.org/3/movie/${movieId}?language=en-US`, options)
    .then(response => response.json())
    .then(movie => {
      fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits`, options)
        .then(response => response.json())
        .then(credits => {
          showMovieDetails(movie, credits, movieCard);
        })
        .catch(err => console.error('Error fetching movie credits:', err));
    })
    .catch(err => console.error('Error fetching movie details:', err));
}
function showMovieDetails(movie, credits, movieCard) {
  const director = getDirector(credits.crew);
  const producers = getProducers(credits.crew);
  const actors= getActors(credits.crew);

  containerEl.querySelectorAll('.movie-card').forEach(card => {
    if (card !== movieCard) {
      card.style.display = 'none';
    }
  });
  movieCard.innerHTML = `
    <div class="movie-details">
      <h2>${movie.title}</h2>
      <p><strong>Release Date:</strong> ${movie.release_date}</p>
      <p><strong>Overview:</strong> ${movie.overview}</p>
      <p><strong>Director:</strong> ${director}</p>
      <p><strong>Producers:</strong> ${producers}</p>
      <p><strong>Actors:</strong> ${actors}</p>
      </div>`;
  movieCard.querySelector('.back-btn').addEventListener('click', () => {
    containerEl.querySelectorAll('.movie-card').forEach(card => {
      card.style.display = 'block';
    });
    movieCard.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
      <div class="movie-title">${movie.title}</div>
      <div class="movie-rating">${movie.vote_average || 'N/A'}</div>
      <button class="details-btn">Show Details</button>
    `;

   
    movieCard.querySelector('.details-btn').addEventListener('click', () => {
      fetchMovieDetails(movie.id, movieCard);
    });
  });
}


function getDirector(crew) {
  const director = crew.find(person => person.job === 'Director');
  return director ? director.name : 'N/A';
}

function getProducers(crew) {
  const producers = crew.filter(person => person.job === 'Producer');
  return producers.map(producer => producer.name).join(', ') || 'N/A';
}

function getActors(cast) {
  // Limit the number of displayed actors to the top 5
  const topActors = cast.slice(0, 5);
  return topActors.map(actor => actor.name).join(', ') || 'N/A';
}

fetch('https://api.themoviedb.org/3/trending/all/day?language=en-US', options)
  .then(response => response.json())
  .then(data => displayMovies(data.results))
  .catch(err => console.error('Error fetching trending data:', err));
