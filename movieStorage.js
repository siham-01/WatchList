const StorageManager = {
  initStorage: function() {
    if (!localStorage.getItem('movieAppData')) {
      localStorage.setItem('movieAppData', JSON.stringify({
        watchlist: [],
        watched: [],
        ratings: {}
      }));
    } else {
      const storage = this.getStorage();
      if (!storage.ratings) {
        storage.ratings = {};
        this.saveStorage(storage);
      }
    }
  },

  addToWatched: function(movie) {
    const storage = this.getStorage();
    const exists = storage.watched.some(m => m.id === movie.id);
    if (!exists) {
        storage.watched.push(movie);
        this.saveStorage(storage);
        return true;
    }
    return false;
},

  getStorage: function() {
    const data = localStorage.getItem('movieAppData');
    return data ? JSON.parse(data) : { watchlist: [], watched: [], ratings: {} };
  },

  saveStorage: function(data) {
    localStorage.setItem('movieAppData', JSON.stringify(data));
  },

  addToWatchlist: function(movie) {
    const storage = this.getStorage();
    const existsInWatchlist = storage.watchlist.some(m => m.id === movie.id);
    const existsInWatched = storage.watched.some(m => m.id === movie.id);

    if (!existsInWatchlist && !existsInWatched) {
      storage.watchlist.push(movie);
      this.saveStorage(storage);
      return true;
    }
    return false;
  },

  // Get watchlist
  getWatchlist: function() {
    return this.getStorage().watchlist;
  },

  // Get watched movies
  getWatched: function() {
    return this.getStorage().watched;
  },

  // Get all ratings
  getRatings: function() {
    return this.getStorage().ratings || {};
  },

  // Get rating for a specific movie
  getRating: function(movieId) {
    return this.getRatings()[movieId] || null;
  },

  // Mark movie as watched with rating
  markAsWatchedWithRating: function(movieId, rating) {
    console.log('markAsWatchedWithRating called:', movieId, rating); // Debug log

    const storage = this.getStorage();
    const movieIndex = storage.watchlist.findIndex(m => m.id === movieId);

    if (movieIndex !== -1) {
      const movie = storage.watchlist[movieIndex];
      const alreadyWatched = storage.watched.some(m => m.id === movieId);

      if (!alreadyWatched) {
        storage.watchlist.splice(movieIndex, 1);
        const watchedMovie = {
          ...movie,
          watchedAt: new Date().toISOString(),
          userRating: rating
        };

        storage.watched.push(watchedMovie);

        // Store rating in ratings object too
        storage.ratings = storage.ratings || {};
        storage.ratings[movieId] = rating;

        this.saveStorage(storage);
        console.log('Movie moved to watched with rating:', watchedMovie); // Debug log
        return true;
      }
    }
    return false;
  },

  // Mark as watched without rating (for backward compatibility)
  markAsWatched: function(movieId) {
    return this.markAsWatchedWithRating(movieId, null);
  },

  // Add or update rating
  addRating: function(movieId, rating) {
    const storage = this.getStorage();
    storage.ratings = storage.ratings || {};
    storage.ratings[movieId] = rating;

    // Update rating in watched list if movie is there
    const watchedIndex = storage.watched.findIndex(m => m.id === movieId);
    if (watchedIndex !== -1) {
      storage.watched[watchedIndex].userRating = rating;
    }

    this.saveStorage(storage);
    return true;
  },

  // Remove from watchlist
  removeFromWatchlist: function(movieId) {
    const storage = this.getStorage();
    const movieIndex = storage.watchlist.findIndex(m => m.id === movieId);
    if (movieIndex !== -1) {
      storage.watchlist.splice(movieIndex, 1);
      this.saveStorage(storage);
      return true;
    }
    return false;
  },

  // Remove from watched list
  removeFromWatched: function(movieId) {
    const storage = this.getStorage();
    const movieIndex = storage.watched.findIndex(m => m.id === movieId);
    if (movieIndex !== -1) {
      storage.watched.splice(movieIndex, 1);
      // Remove rating as well
      if (storage.ratings && storage.ratings[movieId]) {
        delete storage.ratings[movieId];
      }
      this.saveStorage(storage);
      return true;
    }
    return false;
  }
};

StorageManager.initStorage();