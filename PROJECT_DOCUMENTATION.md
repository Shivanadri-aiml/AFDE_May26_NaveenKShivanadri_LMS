# Library Management System — Project Documentation

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Project Structure](#4-project-structure)
5. [Database Schema](#5-database-schema)
6. [Backend — API Reference](#6-backend--api-reference)
7. [Frontend — Pages & Features](#7-frontend--pages--features)
8. [Business Rules & Validations](#8-business-rules--validations)
9. [Setup & Installation](#9-setup--installation)
10. [Running the Project](#10-running-the-project)
11. [Sample Data](#11-sample-data)

---

## 1. Project Overview

The **Library Management System** is a full-stack web application that enables library staff to manage books, register borrowers, issue and return books, and monitor library activity through a live dashboard.

### Key Capabilities

| Capability | Description |
|---|---|
| Book Management | Add, edit, delete books; track availability status |
| Borrower Management | Register and manage library members |
| Borrow / Return | Issue books, record returns, track active loans |
| Search | Full-text keyword search across title, author, category, and ISBN |
| Dashboard | Live stats — total, available, and borrowed books; recent transactions |

---

## 2. Tech Stack

### Backend

| Component | Technology |
|---|---|
| Language | Python 3.13 |
| Web Framework | FastAPI 0.111+ |
| ORM | SQLAlchemy |
| Database | SQLite (file: `library.db`) |
| Validation | Pydantic v2 |
| Server | Uvicorn |

### Frontend

| Component | Technology |
|---|---|
| Language | JavaScript (ES2022) |
| UI Framework | React 18 |
| Build Tool | Vite |
| Routing | React Router v6 |
| HTTP Client | Axios |

---

## 3. Architecture

```
Browser (React SPA)
       │
       │  HTTP / JSON  (http://localhost:3000)
       ▼
  Vite Dev Server
       │
       │  Axios requests  (http://localhost:8000)
       ▼
  FastAPI Application
       │
       ├── Routers (books, borrowers, transactions)
       ├── CRUD layer
       ├── Pydantic schemas (request / response validation)
       │
       ▼
  SQLAlchemy ORM
       │
       ▼
  SQLite Database (library.db)
```

**CORS** is configured on the backend to allow requests from both `http://localhost:3000` and `http://localhost:5173`.

---

## 4. Project Structure

```
library_management/
│
├── backend/
│   ├── main.py              # FastAPI app, CORS config, top-level routes
│   ├── database.py          # SQLAlchemy engine, session factory, Base
│   ├── models.py            # ORM models: Book, Borrower, Transaction
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── crud.py              # All database operations (CRUD + business logic)
│   ├── seed.py              # One-time sample data loader
│   ├── routers/
│   │   ├── books.py         # /books endpoints
│   │   ├── borrowers.py     # /borrowers endpoints
│   │   └── transactions.py  # /borrow, /return, /transactions endpoints
│   ├── requirements.txt     # Python dependencies
│   └── venv/                # Python virtual environment
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx         # React entry point
        ├── App.jsx          # Root layout: sidebar navigation + routing
        ├── index.css        # Global styles
        ├── services/
        │   └── api.js       # Axios client + all API calls
        └── pages/
            ├── Dashboard.jsx    # Stats cards + recent transactions table
            ├── Books.jsx        # Book catalog with add/edit/delete
            ├── Borrowers.jsx    # Borrower list with add/edit/delete
            ├── BorrowReturn.jsx # Issue and return books
            └── Search.jsx       # Keyword search results
```

---

## 5. Database Schema

### books

| Column | Type | Constraints |
|---|---|---|
| book_id | INTEGER | Primary Key, Auto-increment |
| title | VARCHAR | NOT NULL |
| author | VARCHAR | NOT NULL |
| category | VARCHAR | NOT NULL |
| isbn | VARCHAR | NOT NULL, UNIQUE |
| availability_status | VARCHAR | Default: `"available"` |

`availability_status` values: `"available"` or `"borrowed"`

---

### borrowers

| Column | Type | Constraints |
|---|---|---|
| borrower_id | INTEGER | Primary Key, Auto-increment |
| borrower_name | VARCHAR | NOT NULL |
| email | VARCHAR | NOT NULL, UNIQUE |
| phone | VARCHAR | NOT NULL |

---

### transactions

| Column | Type | Constraints |
|---|---|---|
| transaction_id | INTEGER | Primary Key, Auto-increment |
| book_id | INTEGER | Foreign Key → books.book_id |
| borrower_id | INTEGER | Foreign Key → borrowers.borrower_id |
| borrow_date | DATETIME | Default: UTC now |
| return_date | DATETIME | Nullable (NULL = currently borrowed) |

A `NULL` `return_date` means the book is still on loan. When a book is returned, `return_date` is set to the current UTC timestamp.

---

## 6. Backend — API Reference

Base URL: `http://localhost:8000`

Interactive docs (Swagger UI): `http://localhost:8000/docs`

---

### Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |

**Response**
```json
{ "message": "Library Management System API is running" }
```

---

### Books

| Method | Endpoint | Description |
|---|---|---|
| GET | `/books` | List all books |
| GET | `/books/{id}` | Get a single book by ID |
| POST | `/books` | Add a new book |
| PUT | `/books/{id}` | Update book details |
| DELETE | `/books/{id}` | Delete a book |

**POST /books — Request Body**
```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "category": "Technology",
  "isbn": "978-0132350884",
  "availability_status": "available"
}
```

**Book Response Object**
```json
{
  "book_id": 1,
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "category": "Technology",
  "isbn": "978-0132350884",
  "availability_status": "available"
}
```

**Error cases**
- `400` — ISBN already registered (on create)
- `400` — Cannot delete a book that is currently borrowed
- `404` — Book not found

---

### Borrowers

| Method | Endpoint | Description |
|---|---|---|
| GET | `/borrowers` | List all borrowers |
| GET | `/borrowers/{id}` | Get a single borrower by ID |
| POST | `/borrowers` | Register a new borrower |
| PUT | `/borrowers/{id}` | Update borrower details |
| DELETE | `/borrowers/{id}` | Delete a borrower |

**POST /borrowers — Request Body**
```json
{
  "borrower_name": "Alice Johnson",
  "email": "alice@example.com",
  "phone": "9876543210"
}
```

**Borrower Response Object**
```json
{
  "borrower_id": 1,
  "borrower_name": "Alice Johnson",
  "email": "alice@example.com",
  "phone": "9876543210"
}
```

**Error cases**
- `400` — Email already registered (on create)
- `400` — Cannot delete a borrower with active loans
- `404` — Borrower not found

---

### Transactions

| Method | Endpoint | Description |
|---|---|---|
| POST | `/borrow` | Issue a book to a borrower |
| POST | `/return` | Return a borrowed book |
| GET | `/transactions` | List all transactions (newest first) |

**POST /borrow — Request Body**
```json
{
  "book_id": 1,
  "borrower_id": 2
}
```

**POST /return — Request Body**
```json
{
  "transaction_id": 5
}
```

**Transaction Response Object**
```json
{
  "transaction_id": 5,
  "book_id": 1,
  "borrower_id": 2,
  "borrow_date": "2026-05-14T10:30:00",
  "return_date": null,
  "book": { ... },
  "borrower": { ... }
}
```

**Error cases**
- `400` — Book is not available for borrowing
- `400` — Book already returned
- `404` — Transaction not found

---

### Search

| Method | Endpoint | Description |
|---|---|---|
| GET | `/search?q={keyword}` | Search books by keyword |

Searches across: `title`, `author`, `category`, `isbn` (case-insensitive `LIKE` match).

**Example:** `GET /search?q=python`

Returns an array of matching `BookResponse` objects.

---

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | Get library summary statistics |

**Response**
```json
{
  "total_books": 8,
  "available_books": 6,
  "borrowed_books": 2,
  "total_borrowers": 3,
  "recent_transactions": [ ... ]
}
```

`recent_transactions` returns the 5 most recent transactions with nested book and borrower details.

---

## 7. Frontend — Pages & Features

### Dashboard (`/`)

- Displays four stat cards: Total Books, Available Books, Borrowed Books, Total Borrowers
- Shows a table of the 5 most recent transactions with book title, borrower name, borrow date, and status
- Data refreshes on page load via `GET /dashboard`

---

### Books (`/books`)

- Lists all books in a table with title, author, category, ISBN, and availability badge
- **Add Book** button opens a modal form with fields: Title, Author, Category, ISBN
- **Edit** button opens a pre-filled modal to update book details
- **Delete** button removes a book (blocked if the book is currently borrowed)
- Availability shown as a colored badge: green (`available`) / red (`borrowed`)

---

### Borrowers (`/borrowers`)

- Lists all registered borrowers: name, email, phone
- **Add Borrower** modal: Name, Email, Phone
- **Edit** modal: update any borrower field
- **Delete** blocked if the borrower has active (unreturned) loans

---

### Borrow / Return (`/transactions`)

- **Borrow tab**: Select a book and a borrower from dropdowns; submit to issue the book
  - Only `available` books appear in the dropdown
- **Return tab**: Shows all active (unreturned) transactions; click Return to record the return
- **All Transactions tab**: Full transaction history with status indicator

---

### Search (`/search`)

- Single search box; queries `GET /search?q=...` on input change
- Results display as book cards showing title, author, category, ISBN, and availability
- Shows "No results found" when the query returns an empty list

---

## 8. Business Rules & Validations

| Rule | Where Enforced |
|---|---|
| ISBN must be unique | Backend (400 on duplicate) |
| Email must be unique per borrower | Backend (400 on duplicate) |
| Only available books can be borrowed | Backend (400 if status ≠ `"available"`) |
| A book cannot be returned twice | Backend (400 if `return_date` already set) |
| Cannot delete a book with active loans | Backend (400 if open transaction exists) |
| Cannot delete a borrower with active loans | Backend (400 if open transaction exists) |
| Borrow date is recorded in UTC automatically | Backend (set by server on transaction create) |
| Return date is recorded in UTC automatically | Backend (set by server on return) |

---

## 9. Setup & Installation

### Prerequisites

| Tool | Minimum Version |
|---|---|
| Python | 3.9+ |
| Node.js | 18+ |
| npm | 8+ |

---

### Backend Setup

```powershell
# Navigate to backend
cd D:\AI_FDE\library_management\backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# (Optional) Seed sample data
python seed.py
```

---

### Frontend Setup

```powershell
# Navigate to frontend
cd D:\AI_FDE\library_management\frontend

# Install dependencies
npm install
```

---

## 10. Running the Project

### Start Backend

```powershell
cd D:\AI_FDE\library_management\backend
.\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

Backend available at: `http://localhost:8000`
Swagger UI: `http://localhost:8000/docs`

---

### Start Frontend

```powershell
cd D:\AI_FDE\library_management\frontend
npm run dev
```

Frontend available at: `http://localhost:3000`

> Both servers must be running simultaneously for the application to work. Start the backend first.

---

### Quick-Start (Current Environment)

Node.js portable binary is extracted at `D:\AI_FDE\nodejs\node-v20.19.2-win-x64\`. Use it if Node.js is not on the system PATH:

```powershell
# Backend
Start-Process "D:\AI_FDE\library_management\backend\venv\Scripts\python.exe" `
  -ArgumentList "-m","uvicorn","main:app","--reload","--port","8000" `
  -WorkingDirectory "D:\AI_FDE\library_management\backend"

# Frontend
& "D:\AI_FDE\nodejs\node-v20.19.2-win-x64\npm.cmd" run dev `
  --prefix "D:\AI_FDE\library_management\frontend"
```

---

## 11. Sample Data

Loaded by running `python seed.py`. The script is idempotent — running it multiple times will not create duplicate records.

### Sample Books

| Title | Author | Category | ISBN |
|---|---|---|---|
| Clean Code | Robert C. Martin | Technology | 978-0132350884 |
| The Pragmatic Programmer | David Thomas | Technology | 978-0135957059 |
| Design Patterns | Gang of Four | Technology | 978-0201633610 |
| Sapiens | Yuval Noah Harari | History | 978-0062316097 |
| Atomic Habits | James Clear | Self-Help | 978-0735211292 |
| 1984 | George Orwell | Fiction | 978-0451524935 |
| The Great Gatsby | F. Scott Fitzgerald | Fiction | 978-0743273565 |
| A Brief History of Time | Stephen Hawking | Science | 978-0553380163 |

### Sample Borrowers

| Name | Email | Phone |
|---|---|---|
| Alice Johnson | alice@example.com | 9876543210 |
| Bob Smith | bob@example.com | 9123456780 |
| Carol Davis | carol@example.com | 9988776655 |

---

*Document generated: 2026-05-14*
