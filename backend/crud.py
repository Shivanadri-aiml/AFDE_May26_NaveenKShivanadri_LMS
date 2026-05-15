from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime
from fastapi import HTTPException
import models
import schemas


# ── Books ──────────────────────────────────────────────────────────────────────

def get_books(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Book).offset(skip).limit(limit).all()


def get_book(db: Session, book_id: int):
    book = db.query(models.Book).filter(models.Book.book_id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


def create_book(db: Session, book: schemas.BookCreate):
    existing = db.query(models.Book).filter(models.Book.isbn == book.isbn).first()
    if existing:
        raise HTTPException(status_code=400, detail="ISBN already registered")
    db_book = models.Book(**book.model_dump())
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book


def update_book(db: Session, book_id: int, book_update: schemas.BookUpdate):
    db_book = get_book(db, book_id)
    update_data = book_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_book, field, value)
    db.commit()
    db.refresh(db_book)
    return db_book


def delete_book(db: Session, book_id: int):
    db_book = get_book(db, book_id)
    active = db.query(models.Transaction).filter(
        models.Transaction.book_id == book_id,
        models.Transaction.return_date == None
    ).first()
    if active:
        raise HTTPException(status_code=400, detail="Cannot delete a book that is currently borrowed")
    db.delete(db_book)
    db.commit()


def search_books(db: Session, query: str):
    pattern = f"%{query}%"
    return db.query(models.Book).filter(
        or_(
            models.Book.title.ilike(pattern),
            models.Book.author.ilike(pattern),
            models.Book.category.ilike(pattern),
            models.Book.isbn.ilike(pattern),
        )
    ).all()


# ── Borrowers ─────────────────────────────────────────────────────────────────

def get_borrowers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Borrower).offset(skip).limit(limit).all()


def get_borrower(db: Session, borrower_id: int):
    borrower = db.query(models.Borrower).filter(models.Borrower.borrower_id == borrower_id).first()
    if not borrower:
        raise HTTPException(status_code=404, detail="Borrower not found")
    return borrower


def create_borrower(db: Session, borrower: schemas.BorrowerCreate):
    existing = db.query(models.Borrower).filter(models.Borrower.email == borrower.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    db_borrower = models.Borrower(**borrower.model_dump())
    db.add(db_borrower)
    db.commit()
    db.refresh(db_borrower)
    return db_borrower


def update_borrower(db: Session, borrower_id: int, borrower_update: schemas.BorrowerUpdate):
    db_borrower = get_borrower(db, borrower_id)
    update_data = borrower_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_borrower, field, value)
    db.commit()
    db.refresh(db_borrower)
    return db_borrower


def delete_borrower(db: Session, borrower_id: int):
    db_borrower = get_borrower(db, borrower_id)
    active = db.query(models.Transaction).filter(
        models.Transaction.borrower_id == borrower_id,
        models.Transaction.return_date == None
    ).first()
    if active:
        raise HTTPException(status_code=400, detail="Cannot delete a borrower with active loans")
    db.delete(db_borrower)
    db.commit()


# ── Transactions ──────────────────────────────────────────────────────────────

def borrow_book(db: Session, borrow: schemas.BorrowRequest):
    book = get_book(db, borrow.book_id)
    if book.availability_status != "available":
        raise HTTPException(status_code=400, detail="Book is not available for borrowing")
    get_borrower(db, borrow.borrower_id)

    transaction = models.Transaction(
        book_id=borrow.book_id,
        borrower_id=borrow.borrower_id,
        borrow_date=datetime.utcnow(),
    )
    book.availability_status = "borrowed"
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


def return_book(db: Session, return_req: schemas.ReturnRequest):
    transaction = db.query(models.Transaction).filter(
        models.Transaction.transaction_id == return_req.transaction_id
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if transaction.return_date is not None:
        raise HTTPException(status_code=400, detail="Book already returned")

    transaction.return_date = datetime.utcnow()
    transaction.book.availability_status = "available"
    db.commit()
    db.refresh(transaction)
    return transaction


def get_transactions(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(models.Transaction)
        .order_by(models.Transaction.borrow_date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_dashboard_stats(db: Session):
    total_books = db.query(models.Book).count()
    available_books = db.query(models.Book).filter(
        models.Book.availability_status == "available"
    ).count()
    borrowed_books = total_books - available_books
    total_borrowers = db.query(models.Borrower).count()
    recent_transactions = (
        db.query(models.Transaction)
        .order_by(models.Transaction.borrow_date.desc())
        .limit(5)
        .all()
    )
    return {
        "total_books": total_books,
        "available_books": available_books,
        "borrowed_books": borrowed_books,
        "total_borrowers": total_borrowers,
        "recent_transactions": recent_transactions,
    }
