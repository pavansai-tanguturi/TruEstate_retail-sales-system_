import { useEffect, useMemo, useState } from 'react'
import './App.css'
import SearchBar from './components/SearchBar.jsx'
import FilterBar from './components/FilterBar.jsx'
import SortControl from './components/SortControl.jsx'
import Pagination from './components/Pagination.jsx'
import SalesTable from './components/SalesTable.jsx'
import SummaryCards from './components/SummaryCards.jsx'
import { fetchFilters, fetchSales } from './services/api.js'
import { useDebounce } from './hooks/useDebounce.js'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]
const emptyFilters = {
  regions: [],
  genders: [],
  categories: [],
  tags: [],
  paymentMethods: [],
  minAge: null,
  maxAge: null,
  minDate: null,
  maxDate: null,
}

const initialQuery = {
  search: '',
  regions: [],
  genders: [],
  categories: [],
  tags: [],
  paymentMethods: [],
  ageMin: '',
  ageMax: '',
  dateFrom: '',
  dateTo: '',
  sortBy: 'date',
  sortOrder: 'desc',
  page: 1,
  pageSize: 25,
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const [query, setQuery] = useState(initialQuery)
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 200)
  const [filtersMeta, setFiltersMeta] = useState(emptyFilters)

  const [state, setState] = useState({
    data: [],
    total: 0,
    totalPages: 1,
    loading: false,
    error: null,
  })

  const updateQuery = (patch) => {
    setQuery((prev) => ({ ...prev, ...patch }))
  }

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  useEffect(() => {
    document.body.className = `theme-${theme}`
  }, [theme])

  useEffect(() => {
    fetchFilters()
      .then((payload) => setFiltersMeta(payload))
      .catch((err) => setState((prev) => ({ ...prev, error: err.message })))
  }, [])

  useEffect(() => {
    setQuery((prev) => ({ ...prev, page: 1 }))
  }, [debouncedSearch])

  const requestPayload = useMemo(() => ({ ...query, search: debouncedSearch }), [query, debouncedSearch])

  useEffect(() => {
    const abortController = new AbortController()
    
    const run = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const payload = await fetchSales(requestPayload, abortController.signal)
        if (!abortController.signal.aborted) {
          setState({
            data: payload.data,
            total: payload.total,
            totalPages: payload.totalPages,
            loading: false,
            error: null,
          })
          if (payload.page && payload.page !== query.page) {
            setQuery((prev) => ({ ...prev, page: payload.page }))
          }
        }
      } catch (err) {
        if (!abortController.signal.aborted) {
          setState((prev) => ({ ...prev, loading: false, error: err.message }))
        }
      }
    }

    run()
    return () => abortController.abort()
  }, [requestPayload])

  const pageAmountSum = useMemo(
    () => (state.data ? state.data.reduce((sum, row) => sum + (Number(row.totalAmount) || 0), 0) : 0),
    [state.data],
  )

  return (
    <>
      <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
        {theme === 'dark' ? (
          <svg className="theme-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        ) : (
          <svg className="theme-toggle-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        )}
        <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
      </button>
      <div className={`page theme-${theme}`}>
      <header className="page-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Sales Management System</h1>
        </div>
        <SortControl
          sortBy={query.sortBy}
          sortOrder={query.sortOrder}
          onChange={(patch) => updateQuery({ ...patch, page: 1 })}
        />
      </header>

      <div className="toolbar">
        <SearchBar value={searchInput} onChange={setSearchInput} placeholder="Name, Phone no." />
        <div className="toolbar-actions">
          <button type="button" className="clear-btn" onClick={() => { setSearchInput(''); setQuery(initialQuery) }}>
            Reset all
          </button>
        </div>
      </div>

      <FilterBar filtersMeta={filtersMeta} query={query} onUpdate={updateQuery} />

      <SummaryCards total={state.total} pageTotal={state.data ? state.data.length : 0} amountSum={pageAmountSum} />

      {state.error && <div className="error-banner">{state.error}</div>}

      <SalesTable rows={state.data} loading={state.loading} />

      <Pagination
        page={query.page}
        totalPages={state.totalPages}
        pageSize={query.pageSize}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        onPageChange={(page) => updateQuery({ page })}
        onPageSizeChange={(pageSize) => updateQuery({ pageSize, page: 1 })}
      />
      </div>
    </>
  )
}

export default App
