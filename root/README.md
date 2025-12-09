# Overview
Retail Sales Management System with backend CSV ingestion and an interactive dashboard that supports search, filtering, sorting, and paginated browsing of sales records. Data loads once from a CSV so the API stays fast and predictable. UI mirrors the provided structure with search, filter bar, sortable table, and pagination controls. Handles empty states, invalid ranges, and combined filters.

# Tech Stack
- Backend: Node.js, Express, PapaParse, CORS
- Frontend: React (Vite), CSS modules, PropTypes
- Tooling: Nodemon for dev reload

# Search Implementation Summary
Backend performs case-insensitive substring search across customer name and phone. Frontend debounces input before calling the API to avoid noisy requests, preserving active filters and sort. Results remain paginated server-side for consistency.

# Filter Implementation Summary
Filters are multi-select (region, gender, product category, tags, payment method) plus numeric/date ranges (age, date). Backend validates ranges, combines all filters with search and sort, and exposes available filter options from the loaded dataset via `/api/filters`.

# Sorting Implementation Summary
Server-side sorting on date (newest first by default), quantity, and customer name (A–Z by default). Sort toggles keep active search and filters intact; order can be flipped as needed.

# Pagination Implementation Summary
Server-driven pagination at 10 items per page. Requests include the desired page; responses return total, page, and totalPages, and the UI keeps pagination in sync even when filters change.

# Setup Instructions
1) Backend: `cd backend && npm install && npm run dev` (env: `PORT`, `DATA_FILE=./data/sample_sales.csv`, `CORS_ORIGIN`).
2) Frontend: `cd frontend && npm install && npm run dev` (env: `VITE_API_URL=http://localhost:4000`).
3) Place the provided dataset CSV at `backend/data/sample_sales.csv` (or point `DATA_FILE` to it) before starting the backend.
