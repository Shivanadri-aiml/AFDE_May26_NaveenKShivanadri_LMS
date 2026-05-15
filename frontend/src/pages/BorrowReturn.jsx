import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getBooks, getBorrowers, getTransactions, borrowBook, returnBook } from '../services/api'

function BorrowModal({ books, borrowers, onClose, onBorrow }) {
  const [bookId, setBookId] = useState('')
  const [borrowerId, setBorrowerId] = useState('')
  const [saving, setSaving] = useState(false)

  const availableBooks = books.filter((b) => b.availability_status === 'available')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!bookId || !borrowerId) { toast.error('Please select both a book and a borrower'); return }
    setSaving(true)
    try {
      const res = await borrowBook({ book_id: Number(bookId), borrower_id: Number(borrowerId) })
      onBorrow(res.data)
      toast.success('Book borrowed successfully')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Borrow a Book</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label>Select Book</label>
                <select className="form-control" value={bookId} onChange={(e) => setBookId(e.target.value)}>
                  <option value="">— Choose available book —</option>
                  {availableBooks.map((b) => (
                    <option key={b.book_id} value={b.book_id}>{b.title} — {b.author}</option>
                  ))}
                </select>
                {availableBooks.length === 0 && <span className="form-error">No available books right now</span>}
              </div>
              <div className="form-group">
                <label>Select Borrower</label>
                <select className="form-control" value={borrowerId} onChange={(e) => setBorrowerId(e.target.value)}>
                  <option value="">— Choose borrower —</option>
                  {borrowers.map((b) => (
                    <option key={b.borrower_id} value={b.borrower_id}>{b.borrower_name} ({b.email})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving || availableBooks.length === 0}>
              {saving ? 'Processing…' : 'Confirm Borrow'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function BorrowReturn() {
  const [transactions, setTransactions] = useState([])
  const [books, setBooks] = useState([])
  const [borrowers, setBorrowers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBorrowModal, setShowBorrowModal] = useState(false)
  const [filter, setFilter] = useState('all')

  const load = () => {
    Promise.all([getTransactions(), getBooks(), getBorrowers()])
      .then(([txRes, bkRes, brRes]) => {
        setTransactions(txRes.data)
        setBooks(bkRes.data)
        setBorrowers(brRes.data)
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleBorrow = (tx) => {
    setTransactions((prev) => [tx, ...prev])
    setBooks((prev) => prev.map((b) => b.book_id === tx.book_id ? { ...b, availability_status: 'borrowed' } : b))
    setShowBorrowModal(false)
  }

  const handleReturn = async (tx) => {
    if (!window.confirm(`Return "${tx.book?.title}"?`)) return
    try {
      const res = await returnBook({ transaction_id: tx.transaction_id })
      setTransactions((prev) => prev.map((t) => t.transaction_id === tx.transaction_id ? res.data : t))
      setBooks((prev) => prev.map((b) => b.book_id === tx.book_id ? { ...b, availability_status: 'available' } : b))
      toast.success('Book returned successfully')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const displayed = filter === 'active'
    ? transactions.filter((t) => !t.return_date)
    : filter === 'returned'
    ? transactions.filter((t) => !!t.return_date)
    : transactions

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', gap: 8 }}>
            {['all', 'active', 'returned'].map((f) => (
              <button
                key={f}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => setShowBorrowModal(true)}>
            + Borrow Book
          </button>
        </div>
        <div className="table-wrapper">
          {loading ? (
            <div className="empty-state"><p>Loading transactions…</p></div>
          ) : displayed.length === 0 ? (
            <div className="empty-state">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              <p>No {filter !== 'all' ? filter : ''} transactions found.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Book</th><th>Borrower</th><th>Borrow Date</th><th>Return Date</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((tx) => (
                  <tr key={tx.transaction_id}>
                    <td>{tx.transaction_id}</td>
                    <td style={{ fontWeight: 500 }}>{tx.book?.title ?? `Book #${tx.book_id}`}</td>
                    <td>{tx.borrower?.borrower_name ?? `Borrower #${tx.borrower_id}`}</td>
                    <td>{new Date(tx.borrow_date).toLocaleDateString()}</td>
                    <td>{tx.return_date ? new Date(tx.return_date).toLocaleDateString() : '—'}</td>
                    <td>
                      {tx.return_date
                        ? <span className="badge badge-green">Returned</span>
                        : <span className="badge badge-yellow">Active</span>}
                    </td>
                    <td>
                      {!tx.return_date && (
                        <button className="btn btn-success btn-sm" onClick={() => handleReturn(tx)}>
                          Return
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showBorrowModal && (
        <BorrowModal
          books={books}
          borrowers={borrowers}
          onClose={() => setShowBorrowModal(false)}
          onBorrow={handleBorrow}
        />
      )}
    </div>
  )
}
