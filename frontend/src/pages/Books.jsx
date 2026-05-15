import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getBooks, createBook, updateBook, deleteBook } from '../services/api'

const EMPTY_FORM = { title: '', author: '', category: '', isbn: '', availability_status: 'available' }

function BookModal({ book, onClose, onSave }) {
  const [form, setForm] = useState(book ? { ...book } : { ...EMPTY_FORM })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.author.trim()) e.author = 'Author is required'
    if (!form.category.trim()) e.category = 'Category is required'
    if (!form.isbn.trim()) e.isbn = 'ISBN is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setSaving(true)
    try {
      if (book) {
        const res = await updateBook(book.book_id, form)
        onSave(res.data, false)
      } else {
        const res = await createBook(form)
        onSave(res.data, true)
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const field = (name, label, type = 'text', opts) => (
    <div className="form-group">
      <label>{label}</label>
      {type === 'select' ? (
        <select
          className={`form-control${errors[name] ? ' error' : ''}`}
          value={form[name]}
          onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        >
          {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input
          className={`form-control${errors[name] ? ' error' : ''}`}
          type={type}
          value={form[name]}
          onChange={(e) => setForm({ ...form, [name]: e.target.value })}
          placeholder={label}
        />
      )}
      {errors[name] && <span className="form-error">{errors[name]}</span>}
    </div>
  )

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{book ? 'Edit Book' : 'Add New Book'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              {field('title', 'Title')}
              {field('author', 'Author')}
              {field('category', 'Category')}
              {field('isbn', 'ISBN')}
              {field('availability_status', 'Status', 'select', [
                { value: 'available', label: 'Available' },
                { value: 'borrowed', label: 'Borrowed' },
              ])}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : book ? 'Update Book' : 'Add Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Books() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [modalBook, setModalBook] = useState(undefined)
  const [showModal, setShowModal] = useState(false)

  const load = () => {
    setLoading(true)
    getBooks()
      .then((res) => setBooks(res.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSave = (saved, isNew) => {
    if (isNew) {
      setBooks((prev) => [...prev, saved])
      toast.success('Book added successfully')
    } else {
      setBooks((prev) => prev.map((b) => b.book_id === saved.book_id ? saved : b))
      toast.success('Book updated successfully')
    }
    setShowModal(false)
  }

  const handleDelete = async (book) => {
    if (!window.confirm(`Delete "${book.title}"?`)) return
    try {
      await deleteBook(book.book_id)
      setBooks((prev) => prev.filter((b) => b.book_id !== book.book_id))
      toast.success('Book deleted')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const filtered = books.filter((b) =>
    [b.title, b.author, b.category, b.isbn].some((v) =>
      v.toLowerCase().includes(filter.toLowerCase())
    )
  )

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3>Book Catalog ({books.length})</h3>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="search-bar">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                placeholder="Filter books…"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" onClick={() => { setModalBook(undefined); setShowModal(true) }}>
              + Add Book
            </button>
          </div>
        </div>
        <div className="table-wrapper">
          {loading ? (
            <div className="empty-state"><p>Loading books…</p></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              <p>{filter ? 'No books match your filter.' : 'No books yet. Add your first book!'}</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Title</th><th>Author</th><th>Category</th><th>ISBN</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
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
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setModalBook(b); setShowModal(true) }}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <BookModal
          book={modalBook}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
