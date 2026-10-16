# Plano de Implementação - Stream Flix Webapp

## Objetivo
Adicionar funcionalidade de "Top 10 por Gênero" mantendo as 3 seções originais intactas e preservando estado da URL ao atualizar página (F5).

## Estado Atual do Projeto

### ✅ Concluído

1. **Seletor de gênero** - Dropdown adicionado no cabeçalho (`index.html` linha 17-22)
2. **Containers de gênero** - Seção "Top 10 por Gênero" com containers separados para filmes (`genre-movies`) e séries (`genre-tv`) (index.html linha 47-55)
3. **Busca de gêneros separadas** - Mapas `movieGenres` e `tvGenres` distintos para IDs corretos por tipo (script.js linha 16-17)
4. **Função fetchGenres()** - Busca gêneros via `/genre/movie/list` e `/genre/tv/list`, armazenando em mapas separados (script.js linha 88-122)
5. **Função populateGenreSelect()** - Popula o dropdown com gêneros combinados (sem duplicatas), ordenados alfabeticamente (script.js linha 523-540)
6. **Função fetchMoviesByGenre()** - Usa `/discover/movie` com parâmetro `with_genres` e `sort_by=popularity.desc` (script.js linha 164-180)
7. **Função fetchTVShowsByGenre()** - Usa `/discover/tv` com parâmetro `with_genres` e `sort_by=popularity.desc` (script.js linha 183-199)
8. **Função handleGenreChange()** - Carrega Top 10 de filmes e séries para containers separados (script.js linha 542-610)
9. **Preservação de URL** - Estado do gênero salvo na URL (`?genre=Nome`), restaurado no onload (script.js linha 503-519)
10. **Event listener de mudança** - Registrado para `genre-select` (script.js linha 613)
11. **Loading states** - Estados de carregamento em todos os containers (trending-movies, trending-tv, weekly-trending, genre-movies, genre-tv)
12. **Tratamento de erros** - Mensagens de erro em containers via `showError()`
13. **3 seções originais preservadas** - Em Alta Hoje, Séries Populares, Em Alta Esta Semana funcionando normalmente

### 🔧 Melhorias Anteriores Implementadas
- Cache simples para evitar requisições duplicadas
- Busca por texto (filmes/séries/gêneros)
- Sistema de modais com trailers e provedores de streaming
- Design responsivo com scroll horizontal

### 🐛 Bugs Corrigidos
1. **Listener de mudança ausente** - Adicionado `addEventListener('change', handleGenreChange)` no final do script
2. **Logs de debug** - Removidos console.logs de debug (mantidos apenas os de erro)
3. **Estado URL** - Funcionalidade de preservação de gênero via URL funcional

## Arquitetura da API TMDB

### Endpoints Utilizados
- `/genre/movie/list` - Lista de gêneros de filmes
- `/genre/tv/list` - Lista de gêneros de séries
- `/discover/movie` - Descoberta de filmes por gênero
- `/discover/tv` - Descoberta de séries por gênero
- `/trending/movie/day` - Filmes em alta (diário)
- `/trending/tv/day` - Séries em alta (diária)
- `/trending/all/week` - Conteúdo em alta (semanal)
- `/search/multi` - Busca por texto
- `/movie/{id}`, `/tv/{id}` - Detalhes
- `/movie/{id}/videos`, `/tv/{id}/videos` - Trailers
- `/movie/{id}/watch/providers`, `/tv/{id}/watch/providers` - Onde assistir
- `/movie/{id}/credits`, `/tv/{id}/credits` - Créditos

### Importante: IDs de Gênero Diferentes
A API TMDB usa IDs diferentes para categorias similares entre filmes e séries:
- Filmes "Ação" → ID 28
- Séries "Action & Adventure" → ID 10759

Por isso, mapas separados (`movieGenres` e `tvGenres`) são essenciais.

## Estrutura de Arquivos
- `index.html` - Estrutura HTML (70 linhas)
- `script.js` - Lógica JavaScript (613 linhas)
- `style.css` - Estilos CSS (306 linhas)

## Próximos Passos Sugeridos
1. Adicionar debounce na busca de texto (evitar requests excessivos)
2. Implementar cache persistente no localStorage
3. Adicionar paginação infinita nos resultados
4. Melhorar acessibilidade dos cards (aria-labels)
5. Adicionar PWA (Progressive Web App) support

## Status Final
✅ Aplicação funcionando com todas as funcionalidades integradas
✅ Gênero mantido ao atualizar página (F5)
✅ Console limpo (sem erros visíveis)
✅ Compatível com navegadores modernos