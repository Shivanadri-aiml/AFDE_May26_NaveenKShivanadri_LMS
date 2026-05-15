from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from database import engine, get_db
import models
import schemas
import crud
from routers import books, borrowers, transactions

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Library Management System",
    description="REST API for managing books, borrowers, and transactions",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(books.router)
app.include_router(borrowers.router)
app.include_router(transactions.router)


@app.get("/search", response_model=List[schemas.BookResponse], tags=["Search"])
def search_books(q: str = Query(..., min_length=1, description="Search query")):
    from database import SessionLocal
    db = SessionLocal()
    try:
        return crud.search_books(db, q)
    finally:
        db.close()


@app.get("/dashboard", tags=["Dashboard"])
def dashboard_stats(db: Session = Depends(get_db)):
    return crud.get_dashboard_stats(db)


@app.get("/", tags=["Health"])
def root():
    return {"message": "Library Management System API is running"}
