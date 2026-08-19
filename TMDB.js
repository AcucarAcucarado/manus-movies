import axios from 'axios';

const API_KEY = import.meta.env.VITE_TMDB_KEY || '1bf94ba2cbd5b5e8c68c117e8bd3d1dd';

const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    api_key: API_KEY,
    language: 'pt-BR'
  }
});

// Buscar filmes populares (corrigido /movie/popular)
export async function getMoviesPopular(page = 1) {
  try {
    const response = await api.get('/movie/popular', { params: { page } });
    return response.data.results;
  } catch (error) {
    console.error("Erro ao buscar populares:", error.message);
    throw error;
  }
}

// Buscar filmes pelo nome
export async function searchMovies(query, page = 1) {
  if (!query.trim()) return [];
  try {
    const response = await api.get('/search/movie', {
      params: { query, page, include_adult: false }
    });
    return response.data.results;
  } catch (error) {
    console.error("Erro na busca de filmes:", error.message);
    throw error;
  }
}

// Buscar detalhes do filme
export async function getMovieDetails(id) {
  try {
    const response = await api.get(`/movie/${id}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar detalhes:", error.message);
    throw error;
  }
}