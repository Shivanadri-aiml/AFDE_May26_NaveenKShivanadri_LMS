import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getBorrowers, createBorrower, updateBorrower, deleteBorrower } from '../services/api'

const EMPTY = { borrower_name: '', email: '', phone: '' }

function BorrowerModal({ borrower, onClose, onSave }) {
  const [form, setForm] = useState(borrower ? { ...borrower } : { ...EMPTY })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.borrower_name.trim()) e.borrower_name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address'
    if (!form.phone.trim()) e.phone = 'Phone is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      if (borrower) {
        const res = await updateBorrower(borrower.borrower_id, form)
        onSave(res.data, false)
      } else {
        const res = await createBorrower(form)
        onSave(res.data, true)
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const field = (name, label, type = 'text') => (
    <div className="form-group">
      <label>{label}</label>
      <input
        className={`form-control${errors[name] ? ' error' : ''}`}
        type={type}
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        placeholder={label}
      />
      {errors[name] && <span className="form-error">{errors[name]}</span>}
    </div>
  )

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{borrower ? 'Edit Borrower' : 'Add New Borrower'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              {field('borrower_name', 'Full Name')}
              {field('email', 'Email Address', 'email')}
              {field('phone', 'Phone Number', 'tel')}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : borrower ? 'Update Borrower' : 'Add Borrower'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Borrowers() {
  const [borrowers, setBorrowers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [modalBorrower, setModalBorrower] = useState(undefined)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    getBorrowers()
      .then((res) => setBorrowers(res.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = (saved, isNew) => {
    if (isNew) {
      setBorrowers((prev) => [...prev, saved])
      toast.success('Borrower added successfully')
    } else {
      setBorrowers((prev) => prev.map((b) => b.borrower_id === saved.borrower_id ? saved : b))
      toast.success('Borrower updated successfully')
    }
    setShowModal(false)
  }

  const handleDelete = async (borrower) => {
    if (!window.confirm(`Delete "${borrower.borrower_name}"?`)) return
    try {
      await deleteBorrower(borrower.borrower_id)
      setBorrowers((prev) => prev.filter((b) => b.borrower_id !== borrower.borrower_id))
      toast.success('Borrower deleted')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const filtered = borrowers.filter((b) =>
    [b.borrower_name, b.email, b.phone].some((v) =>
      v.toLowerCase().includes(filter.toLowerCase())
    )
  )

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3>Borrowers ({borrowers.length})</h3>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="search-bar">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                placeholder="Filter borrowers…"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" onClick={() => { setModalBorrower(undefined); setShowModal(true) }}>
              + Add Borrower
            </button>
          </div>
        </div>
        <div className="table-wrapper">
          {loading ? (
            <div className="empty-state"><p>Loading borrowers…</p></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <p>{filter ? 'No borrowers match your filter.' : 'No borrowers yet. Add the first one!'}</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.borrower_id}>
                    <td>{b.borrower_id}</td>
                    <td style={{ fontWeight: 500 }}>{b.borrower_name}</td>
                    <td>{b.email}</td>
                    <td>{b.phone}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setModalBorrower(b); setShowModal(true) }}>Edit</button>
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
        <BorrowerModal
          borrower={modalBorrower}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
