const API_KEY = '71b42068e854b467e95255fc85d0d0b9'; // Substitua pela sua chave do TMDB
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// DOM Elements
const modal = document.getElementById('movie-modal');
const modalDetails = document.querySelector('.modal-details');
const closeModalBtn = document.querySelector('.close-modal');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const searchResultsContainer = document.createElement('div');

// Cache simple para evitar requisições desnecessárias
const cache = new Map();
let genreList = {};
let movieGenres = {};
let tvGenres = {};

// Função para buscar detalhes do filme/série
async function fetchMovieDetails(id, type) {
    const cacheKey = `${type}_details_${id}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);
   
    try {
        const response = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}&language=pt-BR`);
        if (!response.ok) throw new Error('Erro ao buscar detalhes');
        const data = await response.json();
        cache.set(cacheKey, data);
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// Função para buscar vídeos (trailers)
async function fetchMovieVideos(id, type) {
    const cacheKey = `${type}_videos_${id}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);
   
    try {
        const response = await fetch(`${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}&language=pt-BR`);
        if (!response.ok) throw new Error('Erro ao buscar vídeos');
        const data = await response.json();
        cache.set(cacheKey, data);
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// Função para buscar provedores de assistência
async function fetchWatchProviders(id, type) {
    const cacheKey = `${type}_providers_${id}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);
   
    try {
        const response = await fetch(`${BASE_URL}/${type}/${id}/watch/providers?api_key=${API_KEY}`);
        if (!response.ok) throw new Error('Erro ao buscar provedores');
        const data = await response.json();
        cache.set(cacheKey, data);
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// Função para buscar créditos (atores principais)
async function fetchMovieCredits(id, type) {
    const cacheKey = `${type}_credits_${id}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);
   
    try {
        const response = await fetch(`${BASE_URL}/${type}/${id}/credits?api_key=${API_KEY}&language=pt-BR`);
        if (!response.ok) throw new Error('Erro ao buscar créditos');
        const data = await response.json();
        cache.set(cacheKey, data);
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// Função para buscar gêneros de filme e TV
async function fetchGenres() {
    try {
        // Buscar gêneros de filme
        const movieResponse = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=pt-BR`);
        const movieData = await movieResponse.json();
       
        // Buscar gêneros de TV
        const tvResponse = await fetch(`${BASE_URL}/genre/tv/list?api_key=${API_KEY}&language=pt-BR`);
        const tvData = await tvResponse.json();
       
        // Criar mapas separados para filmes e TV
        movieGenres = {};
        movieData.genres.forEach(genre => {
            movieGenres[genre.name] = genre.id;
        });
       
        tvGenres = {};
        tvData.genres.forEach(genre => {
            tvGenres[genre.name] = genre.id;
        });
       
        // Combinar gêneros para o dropdown (evitando duplicatas por nome)
        genreList = {};
        [...movieData.genres, ...tvData.genres].forEach(genre => {
            if (!genreList[genre.name]) {
                genreList[genre.name] = genre.id;
            }
        });
       
        return genreList;
    } catch (error) {
        console.error('Erro ao buscar gêneros:', error);
        return {};
    }
}

// Função para buscar por texto (título/nome)
async function fetchSearchResults(query, type = 'multi') {
    if (!query.trim()) return [];
   
    const cacheKey = `search_${type}_${query.toLowerCase()}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);
   
    try {
        let endpoint = '';
        if (type === 'multi') {
            endpoint = `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=pt-BR`;
        } else if (type === 'movie') {
            endpoint = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=pt-BR`;
        } else if (type === 'tv') {
            endpoint = `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=pt-BR`;
        }
       
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Erro ao buscar resultados');
        const data = await response.json();
       
        // Filtrar apenas filmes e séries para multi-search
        let results = [];
        if (type === 'multi') {
            results = data.results.filter(item => 
                item.media_type === 'movie' || item.media_type === 'tv'
            );
        } else {
            results = data.results;
        }
       
        cache.set(cacheKey, results);
        return results;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// Função para buscar filmes por gênero
async function fetchMoviesByGenre(genreName) {
    if (!movieGenres[genreName]) return [];
   
    const genreId = movieGenres[genreName];
    const cacheKey = `genre_movie_${genreId}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);
   
    try {
        const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&language=pt-BR&sort_by=popularity.desc`);
        const data = await response.json();
        cache.set(cacheKey, data.results);
        return data.results;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// Função para buscar séries por gênero
async function fetchTVShowsByGenre(genreName) {
    if (!tvGenres[genreName]) return [];
   
    const genreId = tvGenres[genreName];
    const cacheKey = `genre_tv_${genreId}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);
   
    try {
        const response = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=${genreId}&language=pt-BR&sort_by=popularity.desc`);
        const data = await response.json();
        cache.set(cacheKey, data.results);
        return data.results;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// Função para exibir o modal com detalhes
async function showMovieDetails(id, type) {
    try {
        // Mostrar loading
        modalDetails.innerHTML = '<div class="loading">Carregando detalhes...</div>';
        modal.style.display = 'block';
       
        // Buscar dados em paralelo
        const [details, videos, providers, credits] = await Promise.all([
            fetchMovieDetails(id, type),
            fetchMovieVideos(id, type),
            fetchWatchProviders(id, type),
            fetchMovieCredits(id, type)
        ]);
       
        // Construir HTML do modal
        const posterPath = details.poster_path ? `${IMAGE_BASE_URL}${details.poster_path}` : '';
        const backdropPath = details.backdrop_path ? `${IMAGE_BASE_URL}${details.backdrop_path}` : '';
        const title = details.title || details.name || 'Sem título';
        const releaseDate = details.release_date || details.first_air_date || 'N/A';
        const year = releaseDate ? releaseDate.split('-')[0] : 'N/A';
        const overview = details.overview || 'Descrição não disponível';
        const voteAverage = details.vote_average || 0;
        const genres = details.genres ? details.genres.map(g => g.name).join(', ') : 'Gêneros não disponíveis';
        const runtime = details.runtime ? `${details.runtime} min` : details.episode_run_time?.[0] ? `${details.episode_run_time[0]} min` : 'Duração não disponível';
        const seasons = details.number_of_seasons ? `${details.number_of_seasons} temporadas` : '';
        const episodes = details.number_of_episodes ? `${details.number_of_episodes} episódios` : '';
       
        // Processar vídeos - buscar trailer oficial em PT-BR
        const trailer = videos.results.find(v => 
            v.type.toLowerCase() === 'trailer' && 
            (v.iso_639_1 === 'pt' || v.iso_3166_1 === 'BR' || v.name.toLowerCase().includes('trailer'))
        ) || videos.results.find(v => v.type.toLowerCase() === 'trailer');
       
        // Processar provedores - filtrar por região BR
        const providersData = providers.results?.BR || providers.results?.US || {};
        const watchProviders = providersData.flatrate || [];
       
        // Processar créditos - principais atores (top 5)
        const cast = credits.cast ? credits.cast.slice(0, 5).map(c => c.name) : [];
       
        let modalHTML = `
            <div class="modal-poster">
                ${posterPath ? `<img src="${posterPath}" alt="${title} poster">` : ''}
            </div>
            <div class="modal-info">
                <h2>${title} ${year ? `(${year})` : ''}</h2>
                <div class="details">
                    <span>${genres}</span>
                    <span>${runtime}</span>
                    ${seasons ? `<span>${seasons}</span>` : ''}
                    ${episodes ? `<span>${episodes}</span>` : ''}
                    <span>★ ${voteAverage.toFixed(1)}</span>
                </div>
                <div class="overview">
                    <strong>Sobre:</strong> ${overview}
                </div>
        `;
       
        // Adicionar elenco se disponível
        if (cast.length > 0) {
            modalHTML += `
                <div class="modal-cast">
                    <h3>Elenco Principal</h3>
                    <p>${cast.join(', ')}</p>
                </div>
            `;
        }
       
        // Adicionar trailer se disponível
        if (trailer) {
            modalHTML += `
                <div class="modal-trailer">
                    <h3>Trailer Oficial</h3>
                    <iframe width="100%" height="200" src="https://www.youtube.com/embed/${trailer.key}" 
                            title="Trailer do ${title}" frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen></iframe>
                </div>
            `;
        }
       
        // Adicionar seção de onde assistir
        if (watchProviders.length > 0) {
            modalHTML += `
                <div class="modal-providers">
                    <h3>Onde Assistir</h3>
                    <div class="provider-logos">
            `;
            watchProviders.forEach(provider => {
                if (provider.logo_path) {
                    modalHTML += `<img src="${IMAGE_BASE_URL}${provider.logo_path}" alt="${provider.provider_name}" title="${provider.provider_name}">`;
                }
            });
            modalHTML += `
                    </div>
                </div>
            `;
        }
       
        modalHTML += `</div>`; // Fecha modal-info
       
        modalDetails.innerHTML = modalHTML;
       
    } catch (error) {
        modalDetails.innerHTML = `<div class="error">Erro ao carregar detalhes: ${error.message}</div>`;
        console.error('Erro ao mostrar detalhes do filme:', error);
    }
}

// Função para fechar o modal
function closeModal() {
    modal.style.display = 'none';
    modalDetails.innerHTML = '';
}

// Função para exibir filmes
function displayMovies(movies, container, type) {
    container.innerHTML = ''; // Limpa conteúdo anterior
   
    if (movies.length === 0) {
        container.innerHTML = '<p class="loading">Nenhum conteúdo encontrado</p>';
        return;
    }
   
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        // Armazenar ID e tipo como data attributes
        movieCard.dataset.id = movie.id;
        movieCard.dataset.type = movie.media_type || type;
       
        // Use poster_path se disponível, senão use backdrop_path
        const imagePath = movie.poster_path || movie.backdrop_path;
        if (imagePath) {
            movieCard.style.backgroundImage = `url(${IMAGE_BASE_URL}${imagePath})`;
        } else {
            movieCard.style.backgroundColor = '#333';
            movieCard.innerHTML = '<p style="padding:20px;text-align:center;">Sem imagem</p>';
        }
       
        const title = movie.title || movie.name || 'Sem título';
        const voteAverage = movie.vote_average || 0;
       
        movieCard.innerHTML += `
            <div class="movie-info">
                <div class="movie-title">${title}</div>
                <div class="movie-rating">${voteAverage.toFixed(1)}</div>
            </div>
        `;
       
        container.appendChild(movieCard);
    });
}

// Funções de busca de trending
async function fetchTrendingMovies() {
    try {
        const response = await fetch(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}&language=pt-BR`);
        if (!response.ok) throw new Error('Erro ao buscar filmes em alta');
        const data = await response.json();
        displayMovies(data.results.slice(0, 30), document.getElementById('trending-movies'), 'movie');
    } catch (error) {
        showError(document.getElementById('trending-movies'), error.message);
    }
}

async function fetchTrendingTV() {
    try {
        const response = await fetch(`${BASE_URL}/trending/tv/day?api_key=${API_KEY}&language=pt-BR`);
        if (!response.ok) throw new Error('Erro ao buscar séries em alta');
        const data = await response.json();
        displayMovies(data.results.slice(0, 30), document.getElementById('trending-tv'), 'tv');
    } catch (error) {
        showError(document.getElementById('trending-tv'), error.message);
    }
}

async function fetchWeeklyTrending() {
    try {
        const response = await fetch(`${BASE_URL}/trending/all/week?api_key=${API_KEY}&language=pt-BR`);
        if (!response.ok) throw new Error('Erro ao buscar conteúdo semanal');
        const data = await response.json();
        // Para trending semanal, separar filmes e séries
        const movies = data.results.filter(item => item.media_type === 'movie').slice(0, 30);
        const tvShows = data.results.filter(item => item.media_type === 'tv').slice(0, 30);
        displayMovies(movies, document.getElementById('weekly-movies'), 'movie');
        displayMovies(tvShows, document.getElementById('weekly-tv'), 'tv');
    } catch (error) {
        showError(document.getElementById('weekly-movies'), error.message);
        showError(document.getElementById('weekly-tv'), error.message);
    }
}

// Função para buscar filmes em cartaz nos cinemas
async function fetchNowPlayingMovies() {
    try {
        const response = await fetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=pt-BR&page=1`);
        if (!response.ok) throw new Error('Erro ao buscar filmes em cartaz');
        const data = await response.json();
        displayMovies(data.results.slice(0, 20), document.getElementById('now-playing-movies'), 'movie');
    } catch (error) {
        showError(document.getElementById('now-playing-movies'), error.message);
    }
}
function showError(container, message) {
    container.innerHTML = `<p class="error">Erro: ${message}</p>`;
}

// Função para exibir resultados de busca
function displaySearchResults(movies) {
    // Limpar resultados anteriores
    searchResultsContainer.innerHTML = '';
    searchResultsContainer.className = 'search-results-container';
   
    if (movies.length === 0) {
        searchResultsContainer.innerHTML = '<p class="loading">Nenhum resultado encontrado</p>';
        document.querySelector('.main').appendChild(searchResultsContainer);
        return;
    }
   
    // Criar título para a seção de resultados
    const resultsHeader = document.createElement('h2');
    resultsHeader.textContent = 'Resultados da Busca';
    resultsHeader.style.color = '#e50914';
    resultsHeader.style.marginBottom = '20px';
    searchResultsContainer.appendChild(resultsHeader);
   
    // Criar container para os filmes
    const moviesContainer = document.createElement('div');
    moviesContainer.className = 'movies-container';
    moviesContainer.id = 'search-results';
   
    displayMovies(movies, moviesContainer, 'multi'); // Usar multi para buscar ambos
    searchResultsContainer.appendChild(moviesContainer);
   
    // Adicionar ao main (após o header)
    const header = document.querySelector('.header');
    header.insertAdjacentElement('afterend', searchResultsContainer);
}

// Event listeners
document.addEventListener('click', (e) => {
    if (e.target === closeModalBtn) {
        closeModal();
    }
   
    // Fechar modal ao clicar fora dele
    if (e.target === modal) {
        closeModal();
    }
   
    // Lidar com clique nos cards (usando delegação)
    const movieCard = e.target.closest('.movie-card');
    if (movieCard) {
        const id = movieCard.dataset.id;
        const type = movieCard.dataset.type;
        if (id && type) {
            showMovieDetails(id, type);
        }
    }
});

// Tecla ESC para fechar modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') {
        closeModal();
    }
});

// Funcionalidade de busca
async function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) {
        showError(document.getElementById('trending-movies'), 'Por favor, digite algo para buscar');
        return;
    }
   
    try {
        // Mostrar loading nos containers existentes
        document.getElementById('trending-movies').innerHTML = '<p class="loading">Buscando...</p>';
        document.getElementById('trending-tv').innerHTML = '<p class="loading">Buscando...</p>';
        document.getElementById('weekly-trending').innerHTML = '<p class="loading">Buscando...</p>';
       
        // Remover resultados de busca anteriores se existirem
        if (document.querySelector('.search-results-container')) {
            document.querySelector('.search-results-container').remove();
        }
       
        // Buscar resultados
        const results = await fetchSearchResults(query, 'multi');
        displaySearchResults(results);
       
        // Limpar o input após a busca
        searchInput.value = '';
    } catch (error) {
        showError(document.getElementById('trending-movies'), error.message);
    }
}

// Event listeners para busca
searchButton.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

// Inicializa o app quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', async () => {
    // Buscar gêneros primeiro
    await fetchGenres();
    // Buscar filmes em cartaz
    await fetchNowPlayingMovies();
    // Popular o select de gênero
    populateGenreSelect();
});
   
    // Check URL for genre parameter
    const urlParams = new URLSearchParams(window.location.search);
    const genreParam = urlParams.get('genre');
    if (genreParam) {
        // Decode the genre parameter (it might be URL-encoded)
        const decodedGenre = decodeURIComponent(genreParam);
        const genreSelect = document.getElementById('genre-select');
        if (genreSelect) {
            genreSelect.value = decodedGenre;
            await handleGenreChange();
        }
    } else {
        // Carregar o conteúdo inicial (trending)
        fetchTrendingMovies();
        fetchTrendingTV();
        fetchWeeklyTrending();
    }
});

// Função para popular o select de gêneros
async function populateGenreSelect() {
    try {
        const genreSelect = document.getElementById('genre-select');
        // Clear existing options except the first one
        genreSelect.innerHTML = '<option value="">Todos os gêneros</option>';
       
        // Add genres sorted alphabetically
        const sortedGenres = Object.keys(genreList).sort();
        sortedGenres.forEach(genreName => {
            const option = document.createElement('option');
            option.value = genreName;
            option.textContent = genreName;
            genreSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao popular gêneros:', error);
    }
}

// Funcionalidade de filtro por gênero
async function handleGenreChange() {
    const genreSelect = document.getElementById('genre-select');
    const selectedGenre = genreSelect.value;
  
    // Helper to toggle sections visibility
    function toggleSections(showGenreSection) {
        const sections = [
            document.getElementById('trending-movies').parentElement,
            document.getElementById('trending-tv').parentElement,
            document.getElementById('weekly-trending').parentElement
        ];
        const genreSection = document.getElementById('genre-movies').parentElement;
        
        sections.forEach(section => {
            section.style.display = showGenreSection ? 'none' : 'block';
        });
        genreSection.style.display = showGenreSection ? 'block' : 'none';
    }
  
    if (!selectedGenre) {
        // Show all sections and hide genre section
        toggleSections(false); // false = show trending sections, hide genre section
      
        // Show loading in trending sections and reload them
        document.getElementById('trending-movies').innerHTML = '<p class="loading">Carregando...</p>';
        document.getElementById('trending-tv').innerHTML = '<p class="loading">Carregando...</p>';
        document.getElementById('weekly-trending').innerHTML = '<p class="loading">Carregando...</p>';
      
        // Remove any existing search results
        if (document.querySelector('.search-results-container')) {
            document.querySelector('.search-results-container').remove();
        }
      
        // Reload trending content
        fetchTrendingMovies();
        fetchTrendingTV();
        fetchWeeklyTrending();
      
        // Update URL to remove genre parameter
        const url = new URL(window.location);
        url.searchParams.delete('genre');
        window.history.pushState({path: url.href}, '', url);
        return;
    }
  
    try {
        // Hide trending sections and show genre section
        toggleSections(true); // true = show genre section, hide trending sections
      
        // Show loading states in genre section only
        document.getElementById('genre-movies').innerHTML = '<p class="loading">Carregando filmes por gênero...</p>';
        document.getElementById('genre-tv').innerHTML = '<p class="loading">Carregando séries por gênero...</p>';
      
        // Remove any existing search results
        if (document.querySelector('.search-results-container')) {
            document.querySelector('.search-results-container').remove();
        }
      
        // Fetch movies and TV shows by genre using separate maps
        const movies = await fetchMoviesByGenre(selectedGenre);
        const tvShows = await fetchTVShowsByGenre(selectedGenre);
      
        // Display results in the genre section
                displayMovies(movies.slice(0, 30), document.getElementById('genre-movies'), 'movie');
                displayMovies(tvShows.slice(0, 30), document.getElementById('genre-tv'), 'tv');
      
        // Update URL with selected genre
        const url = new URL(window.location);
        url.searchParams.set('genre', encodeURIComponent(selectedGenre));
        window.history.pushState({path: url.href}, '', url);
      
    } catch (error) {
        console.error('error in handleGenreChange:', error);
        showError(document.getElementById('genre-movies'), error.message);
        showError(document.getElementById('genre-tv'), error.message);
    }
}

// Event listener para mudança de gênero
document.getElementById('genre-select').addEventListener('change', handleGenreChange);
