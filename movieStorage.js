const StorageManager = {
  // Initialize storage if it doesn't exist
  initStorage: function() {
    if (!localStorage.getItem('movieAppData')) {
      localStorage.setItem('movieAppData', JSON.stringify({
        watchlist: [],
        watched: []
      }));
    }
  },

  // Get all storage data
  getStorage: function() {
    return JSON.parse(localStorage.getItem('movieAppData'));
  },

  // Save all storage data
  saveStorage: function(data) {
    localStorage.setItem('movieAppData', JSON.stringify(data));
  },

  // Add movie to watchlist
  addToWatchlist: function(movie) {
    const storage = this.getStorage();
    // Check if movie already exists in watchlist
    const exists = storage.watchlist.some(m => m.id === movie.id);
    if (!exists) {
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

  // Mark movie as watched
  markAsWatched: function(movieId) {
    const storage = this.getStorage();
    const movieIndex = storage.watchlist.findIndex(m => m.id === movieId);

    if (movieIndex !== -1) {
      const movie = storage.watchlist[movieIndex];
      const alreadyWatched = storage.watched.some(m => m.id === movieId);

      if (!alreadyWatched) {
        storage.watchlist.splice(movieIndex, 1);
        storage.watched.push({
          ...movie,
          watchedAt: new Date().toISOString()
        });
        this.saveStorage(storage);
        return true;
      }
    }
    return false;
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
      this.saveStorage(storage);
      return true;
    }
    return false;
  }
};
StorageManager.initStorage();