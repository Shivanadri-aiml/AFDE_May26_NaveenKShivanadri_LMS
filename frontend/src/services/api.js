import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.detail || err.message || 'An error occurred'
    return Promise.reject(new Error(message))
  }
)

// Books
export const getBooks = () => api.get('/books')
export const getBook = (id) => api.get(`/books/${id}`)
export const createBook = (data) => api.post('/books', data)
export const updateBook = (id, data) => api.put(`/books/${id}`, data)
export const deleteBook = (id) => api.delete(`/books/${id}`)

// Borrowers
export const getBorrowers = () => api.get('/borrowers')
export const getBorrower = (id) => api.get(`/borrowers/${id}`)
export const createBorrower = (data) => api.post('/borrowers', data)
export const updateBorrower = (id, data) => api.put(`/borrowers/${id}`, data)
export const deleteBorrower = (id) => api.delete(`/borrowers/${id}`)

// Transactions
export const borrowBook = (data) => api.post('/borrow', data)
export const returnBook = (data) => api.post('/return', data)
export const getTransactions = () => api.get('/transactions')

// Search
export const searchBooks = (q) => api.get('/search', { params: { q } })

// Dashboard
export const getDashboard = () => api.get('/dashboard')
