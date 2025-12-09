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

const PAGE_SIZE = 10
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
  pageSize: PAGE_SIZE,
}

function App() {
  const [query, setQuery] = useState(initialQuery)
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 350)
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
    const run = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const payload = await fetchSales(requestPayload)
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
      } catch (err) {
        setState((prev) => ({ ...prev, loading: false, error: err.message }))
      }
    }

    run()
  }, [requestPayload])

  const pageAmountSum = useMemo(
    () => state.data.reduce((sum, row) => sum + (Number(row.totalAmount) || 0), 0),
    [state.data],
  )

  return (
    <div className="page">
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

      <SummaryCards total={state.total} pageTotal={state.data.length} amountSum={pageAmountSum} />

      {state.error && <div className="error-banner">{state.error}</div>}

      <SalesTable rows={state.data} loading={state.loading} />

      <Pagination
        page={query.page}
        totalPages={state.totalPages}
        onPageChange={(page) => updateQuery({ page })}
      />
    </div>
  )
}

export default App
