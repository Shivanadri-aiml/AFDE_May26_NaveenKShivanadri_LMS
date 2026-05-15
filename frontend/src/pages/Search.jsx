import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { searchBooks } from '../services/api'

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) { inputRef.current?.focus(); return }
    setLoading(true)
    setSearched(false)
    try {
      const res = await searchBooks(q)
      setResults(res.data)
      setSearched(true)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setSearched(false)
    inputRef.current?.focus()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <svg
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: 'var(--gray-500)', pointerEvents: 'none' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                className="form-control"
                style={{ paddingLeft: 40, paddingRight: query ? 36 : 12 }}
                type="text"
                placeholder="Search by title, author, category, or ISBN…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--gray-500)', padding: 2, cursor: 'pointer' }}
                >✕</button>
              )}
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Searching…' : 'Search'}
            </button>
          </form>

          <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Fiction', 'Science', 'History', 'Technology', 'Biography'].map((cat) => (
              <button
                key={cat}
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setQuery(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {searched && (
        <div className="card">
          <div className="card-header">
            <h3>
              {results.length === 0
                ? `No results for "${query}"`
                : `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`}
            </h3>
          </div>
          <div className="table-wrapper">
            {results.length === 0 ? (
              <div className="empty-state">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <p>Try a different keyword or browse by category above.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th><th>Title</th><th>Author</th><th>Category</th><th>ISBN</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((b) => (
                    <tr key={b.book_id}>
                      <td>{b.book_id}</td>
                      <td style={{ fontWeight: 500 }}>{b.title}</td>
                      <td>{b.author}</td>
                      <td>{b.category}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{b.isbn}</td>
                      <td>
                        <span className={`badge ${b.availability_status === 'available' ? 'badge-green' : 'badge-red'}`}>
                          {b.availability_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {!searched && (
        <div className="empty-state" style={{ marginTop: 40 }}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p>Enter a keyword above and press Search to find books.</p>
        </div>
      )}
    </div>
  )
}
