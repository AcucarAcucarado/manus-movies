const STORAGE_KEY = 'manus_movie_favorites';

// Obter lista de favoritos
export function getFavorite() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (error) {
    console.error('Erro ao ler favoritos:', error.message);
    return [];
  }
}

// Salvar um filme completo na lista
export function saveFavorite(movie) {
  if (!movie || !movie.id) return;
  const favorites = getFavorite();
  const alreadyExists = favorites.some(fav => fav.id === movie.id);

  if (!alreadyExists) {
    favorites.push(movie);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }
}

// Remover um filme dos favoritos pelo ID
export function removeFavorite(movieId) {
  const favorites = getFavorite();
  const updatedFavorites = favorites.filter(fav => fav.id !== movieId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFavorites));
}