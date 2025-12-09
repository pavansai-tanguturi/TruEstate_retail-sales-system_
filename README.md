# Overview
TruEstate Retail Sales Management System is a full-stack web application for managing and analyzing retail sales data. The system features a MongoDB-backed REST API with Express and a modern React dashboard. It supports advanced search, multi-criteria filtering, sorting, and smart pagination across 500,000+ sales records with optimized performance through database indexing and React optimization techniques.

# Tech Stack
- **Backend**: Node.js, Express 5, MongoDB, Mongoose 8.9.0
- **Frontend**: React 19.2.0, Vite, Custom Hooks (useDebounce)
- **Database**: MongoDB Atlas with compound indexes
- **Styling**: CSS with CSS Custom Properties (Dark/Light themes)
- **Performance**: AbortController, React.memo, Database Indexes, Field Projection

# Search Implementation Summary
Real-time search implemented with 200ms debouncing to minimize API calls. Backend performs case-insensitive regex matching on customer name and phone number fields. Search integrates seamlessly with active filters and maintains pagination state. AbortController cancels pending requests when new searches are initiated for optimal performance.

# Filter Implementation Summary
Multi-select filters for regions, genders, product categories, tags (15 unique values), and payment methods. Numeric range filters for age (min/max) and date range filters (from/to). Backend uses MongoDB aggregation pipeline with `$match` stage combining all filter criteria. Filter metadata endpoint (`/api/filters`) provides available options dynamically. Tags are properly unwound using `$unwind` to prevent duplication.

# Sorting Implementation Summary
Server-side sorting on date (default: newest first), quantity, total amount, and customer name. Sort order toggles between ascending and descending. Backend implements sorting via MongoDB `.sort()` with indexed fields for fast queries. Sort state persists across filter changes and pagination navigation.

# Pagination Implementation Summary
Smart pagination with ellipsis display showing current page ±2 with First/Last buttons. Page size selector (10/25/50/100 records per page) and jump-to-page input for direct navigation. Backend uses MongoDB `.skip()` and `.limit()` for efficient server-side pagination. API returns total records, current page, and total pages for accurate UI rendering. Shows maximum of ~7 page buttons to avoid overwhelming UI.

# Setup Instructions

## Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- CSV dataset file

## Backend Setup
1. Navigate to backend directory:
   ```bash
   cd root/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file (use `.env.example` as template):
   ```env
   MONGO_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/?appName=your_cluster
   PORT=4000
   CORS_ORIGIN=*
   DATA_FILE=./data/truestate_assignment_dataset.csv
   ```

4. Place CSV dataset in `root/backend/data/` directory

5. Seed database (imports up to 500,000 records):
   ```bash
   node src/utils/seedRemaining.js
   ```

6. Start backend server:
   ```bash
   npm start
   ```
   Server runs on `http://localhost:4000`

## Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd root/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```
   Application runs on `http://localhost:5173`

## Features
- 🔍 Real-time search with debouncing
- 🎯 Multi-select and range filters
- 📊 Sortable columns with toggle order
- 📄 Smart pagination with page size options
- 🌓 Dark/Light theme toggle with persistence
- ⚡ Optimized performance with database indexes
- 💀 Skeleton loading states
- 📱 Responsive design
