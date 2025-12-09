# Architecture

## Backend architecture
- Express 5 app with modular layers: routes -> controllers -> services -> utils.
- CSV ingestion at startup via PapaParse; data normalized and cached in memory for fast in-process queries.
- Service layer applies search, multi-filter, sorting, and pagination in a single pass; validates ranges and reports issues.
- Filter metadata computed once (distinct regions, categories, tags, etc.) and served via `/api/filters`.
- Configurable via environment (`PORT`, `DATA_FILE`, `CORS_ORIGIN`).

## Frontend architecture
- React (Vite) single-page dashboard composed of small presentational components (search bar, filters, summary cards, table, pagination).
- State lives in `App.jsx` with debounced search and derived request payload; API access isolated in `services/api.js`.
- Prop-driven components with PropTypes; formatting helpers for currency/date in `utils/formatters.js`.
- CSS-only styling matching the required layout (no external UI kit).

## Data flow
1. On backend boot, CSV is parsed and cached; distinct filter options are derived.
2. Frontend fetches `/api/filters` once to populate filter controls.
3. User interactions update query state (search, filters, sort, page); debounced search reduces request churn.
4. Frontend calls `/api/sales` with consolidated query params; backend returns paginated, sorted, filtered rows.
5. UI renders the table, summary cards, and pagination using the response; errors and empty states are shown inline.

## Folder structure
- `backend/src/index.js`: Express bootstrap, middleware, routes registration.
- `backend/src/routes/`: Route definitions (`salesRoutes.js`).
- `backend/src/controllers/`: Request parsing and response handling (`salesController.js`).
- `backend/src/services/`: Core business logic and data querying (`salesService.js`).
- `backend/src/utils/`: CSV loader and query parsing helpers (`dataLoader.js`, `queryParser.js`).
- `backend/data/`: CSV source file (sample provided).
- `frontend/src/components/`: UI building blocks (filters, search, table, pagination, summary cards).
- `frontend/src/services/`: API client for backend calls.
- `frontend/src/utils/`: Formatting helpers.
- `frontend/src/hooks/`: Reusable hooks (debounce).
- `frontend/src/styles/`: Styling slot (not yet populated) plus component CSS in `App.css`.

## Module responsibilities
- `dataLoader`: Read and normalize CSV rows (numbers, dates, tags) into typed records.
- `salesService`: Initialize in-memory store, compute filter metadata, apply search/filters/sort/pagination, and guard invalid ranges.
- `salesController`: Parse query params, validate ranges, and translate service results to HTTP responses.
- `salesRoutes`: Map HTTP routes to controllers.
- `api.js`: Build query strings, call backend endpoints, and normalize error handling.
- `App.jsx`: Owns dashboard state, orchestrates data fetching, and composes UI components.
- `FilterBar`, `SearchBar`, `SortControl`, `Pagination`, `SalesTable`, `SummaryCards`: Presentational components consuming props and emitting state changes.
- `formatters`: Utility formatting for INR currency and ISO-like dates.
- `useDebounce`: Debounce hook for search input to keep API calls performant.
