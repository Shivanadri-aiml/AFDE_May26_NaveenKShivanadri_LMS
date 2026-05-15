# Library Management System

A full-stack web application for managing books, borrowers, and library transactions.

**Tech Stack:** React (Vite) · FastAPI · SQLite · SQLAlchemy · Axios

---

## Project Structure

```
library_management/
├── backend/
│   ├── main.py            # FastAPI app entry point
│   ├── database.py        # SQLAlchemy engine & session
│   ├── models.py          # ORM models (Book, Borrower, Transaction)
│   ├── schemas.py         # Pydantic request/response schemas
│   ├── crud.py            # All database operations
│   ├── seed.py            # Sample data loader
│   ├── routers/
│   │   ├── books.py
│   │   ├── borrowers.py
│   │   └── transactions.py
│   └── requirements.txt
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── services/
        │   └── api.js         # Axios API client
        └── pages/
            ├── Dashboard.jsx
            ├── Books.jsx
            ├── Borrowers.jsx
            ├── BorrowReturn.jsx
            └── Search.jsx
```

---

## Setup & Installation

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm 8+

### Backend

```bash
cd library_management/backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# (Optional) Load sample data
python seed.py

# Start server
uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000  
Interactive API docs: http://localhost:8000/docs

### Frontend

```bash
cd library_management/frontend

npm install
npm run dev
```

Frontend runs at: http://localhost:3000

---

## API Reference

### Books

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/books` | List all books |
| GET | `/books/{id}` | Get book by ID |
| POST | `/books` | Add a new book |
| PUT | `/books/{id}` | Update book |
| DELETE | `/books/{id}` | Delete book |

### Borrowers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/borrowers` | List all borrowers |
| GET | `/borrowers/{id}` | Get borrower by ID |
| POST | `/borrowers` | Add a new borrower |
| PUT | `/borrowers/{id}` | Update borrower |
| DELETE | `/borrowers/{id}` | Delete borrower |

### Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/borrow` | Borrow a book |
| POST | `/return` | Return a book |
| GET | `/transactions` | List all transactions |

### Search & Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/search?q=keyword` | Search books (title/author/category/ISBN) |
| GET | `/dashboard` | Get summary stats |

---

## Database Schema

### books
| Column | Type |
|--------|------|
| book_id | Integer PK |
| title | String |
| author | String |
| category | String |
| isbn | String (unique) |
| availability_status | String (available/borrowed) |

### borrowers
| Column | Type |
|--------|------|
| borrower_id | Integer PK |
| borrower_name | String |
| email | String (unique) |
| phone | String |

### transactions
| Column | Type |
|--------|------|
| transaction_id | Integer PK |
| book_id | Integer FK → books |
| borrower_id | Integer FK → borrowers |
| borrow_date | DateTime |
| return_date | DateTime (nullable) |

---

## Features

- **Dashboard** — Live stats (total/available/borrowed books, borrower count) with recent transactions
- **Book Management** — Add, edit, delete books with availability status tracking
- **Borrower Management** — Register and manage library members
- **Borrow / Return** — Issue books to borrowers, record returns, filter by active/returned
- **Search** — Full-text keyword search across title, author, category, and ISBN
- **Validation** — Form validation on frontend; business rule enforcement on backend
- **Error Handling** — Toast notifications for all operations
