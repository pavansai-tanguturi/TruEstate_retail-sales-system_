# Backend

Express service that loads the sales CSV once at startup and exposes a single paginated `/api/sales` endpoint with search, filtering, and sorting plus a `/health` check.

## Running locally

```bash
cd backend
npm install
npm run dev
```

Environment variables (optional):

- `PORT` (default `4000`)
- `DATA_FILE` (path to CSV, default `./data/sample_sales.csv`)
- `CORS_ORIGIN` (allowed origin, default `*`)
