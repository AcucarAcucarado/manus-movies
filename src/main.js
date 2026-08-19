import { getMoviesPopular, searchMovies } from './services/TMDB.js';
import { getFavorite, saveFavorite, removeFavorite } from './services/favorites.js';

// Elementos do DOM
const moviesGrid = document.getElementById('movies-grid');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const statusMessage = document.getElementById('status-message');
const sectionTitle = document.getElementById('section-title');
const btnPopular = document.getElementById('btn-popular');
const btnFavorites = document.getElementById('btn-favorites');

// Estado da Aplicação
let currentView = 'popular'; // 'popular', 'search', ou 'favorites'

// Base URL oficial do TMDB para carregar as capas dos filmes
const POSTER_BASE_URL = 'https://image.tmdb.org/t500';

// --- FUNÇÕES DE INTERFACE (UX & DOM) ---

// Exibe mensagem de carregamento ou erro
function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.remove('hidden');
  if (isError) {
    statusMessage.style.color = '#e50914';
  } else {
    statusMessage.style.color = '#a8a8b3';
  }
}

// Esconde as mensagens de status
function hideStatus() {
  statusMessage.textContent = '';
  statusMessage.classList.add('hidden');
}

// Renderiza a lista de filmes na tela
function renderMovies(movies) {
  moviesGrid.innerHTML = '';

  if (!movies || movies.length === 0) {
    showStatus('Nenhum filme encontrado.');
    return;
  }

  hideStatus();

  const favorites = getFavorite();

  movies.forEach(movie => {
    // Verifica se este filme já está favoritado
    const isFav = favorites.some(fav => fav.id === movie.id);

    // Trata caso o filme não tenha imagem de capa
    const posterUrl = movie.poster_path 
      ? `${POSTER_BASE_URL}${movie.poster_path}` 
      : 'https://via.placeholder.com/500x750?text=Sem+Imagem';

    // Trata nota do filme (casas decimais)
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

    // Criando o elemento HTML do Card
    const card = document.createElement('article');
    card.className = 'movie-card';
    card.innerHTML = `
      <img class="movie-poster" src="${posterUrl}" alt="${movie.title}">
      <div class="movie-info">
        <h3 class="movie-title">${movie.title}</h3>
        <span class="movie-rating">★ ${rating}</span>
        <p class="movie-overview">${movie.overview || 'Sinopse não disponível.'}</p>
        <button class="fav-btn ${isFav ? 'is-favorite' : ''}" data-id="${movie.id}">
          ${isFav ? '❤️ Favorito' : '🤍 Favoritar'}
        </button>
      </div>
    `;

    // Evento do botão de Favoritar/Desfavoritar
    const favBtn = card.querySelector('.fav-btn');
    favBtn.addEventListener('click', () => handleFavoriteClick(movie));

    moviesGrid.appendChild(card);
  });
}

// --- LÓGICA DE DADOS E EVENTOS ---

// Alternar entre Favoritar e Remover dos Favoritos
function handleFavoriteClick(movie) {
  const favorites = getFavorite();
  const isFav = favorites.some(fav => fav.id === movie.id);

  if (isFav) {
    removeFavorite(movie.id);
  } else {
    saveFavorite(movie);
  }

  // Se estiver na aba de favoritos, re-renderiza a lista atualizada
  if (currentView === 'favorites') {
    loadFavorites();
  } else {
    // Atualiza apenas os botões na tela atual
    updateFavoriteButtons();
  }
}

// Atualiza o estado dos botões de favoritos visíveis
function updateFavoriteButtons() {
  const favorites = getFavorite();
  const buttons = document.querySelectorAll('.fav-btn');

  buttons.forEach(btn => {
    const movieId = Number(btn.getAttribute('data-id'));
    const isFav = favorites.some(fav => fav.id === movieId);
    btn.className = `fav-btn ${isFav ? 'is-favorite' : ''}`;
    btn.textContent = isFav ? '❤️ Favorito' : '🤍 Favoritar';
  });
}

// Carrega os filmes populares da API
async function loadPopularMovies() {
  currentView = 'popular';
  sectionTitle.textContent = 'Filmes Populares';
  btnPopular.classList.add('active');
  btnFavorites.classList.remove('active');
  
  showStatus('Carregando filmes populares...');
  try {
    const movies = await getMoviesPopular();
    renderMovies(movies);
  } catch (error) {
    showStatus('Falha ao carregar os filmes. Verifique sua chave de API ou conexão.', true);
  }
}

// Busca filmes na API a partir do formulário
async function handleSearch(event) {
  event.preventDefault();
  const query = searchInput.value.trim();

  if (!query) return;

  currentView = 'search';
  sectionTitle.textContent = `Resultados para: "${query}"`;
  btnPopular.classList.remove('active');
  btnFavorites.classList.remove('active');

  showStatus('Buscando filmes...');
  try {
    const movies = await searchMovies(query);
    renderMovies(movies);
  } catch (error) {
    showStatus('Erro ao buscar filmes. Tente novamente.', true);
  }
}

// Carrega a lista de filmes salvos no Local Storage
function loadFavorites() {
  currentView = 'favorites';
  sectionTitle.textContent = 'Meus Filmes Favoritos';
  btnFavorites.classList.add('active');
  btnPopular.classList.remove('active');

  const favorites = getFavorite();
  renderMovies(favorites);
}

// --- INICIALIZAÇÃO E LISTENERS ---

searchForm.addEventListener('submit', handleSearch);

btnPopular.addEventListener('click', () => {
  searchInput.value = '';
  loadPopularMovies();
});

btnFavorites.addEventListener('click', () => {
  searchInput.value = '';
  loadFavorites();
});

// Executa assim que a página carrega
loadPopularMovies();