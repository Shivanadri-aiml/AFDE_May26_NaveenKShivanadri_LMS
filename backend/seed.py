"""Run once to populate the database with sample data."""
from database import engine, SessionLocal
import models

models.Base.metadata.create_all(bind=engine)

BOOKS = [
    {"title": "Clean Code", "author": "Robert C. Martin", "category": "Technology", "isbn": "978-0132350884"},
    {"title": "The Pragmatic Programmer", "author": "David Thomas", "category": "Technology", "isbn": "978-0135957059"},
    {"title": "Design Patterns", "author": "Gang of Four", "category": "Technology", "isbn": "978-0201633610"},
    {"title": "Sapiens", "author": "Yuval Noah Harari", "category": "History", "isbn": "978-0062316097"},
    {"title": "Atomic Habits", "author": "James Clear", "category": "Self-Help", "isbn": "978-0735211292"},
    {"title": "1984", "author": "George Orwell", "category": "Fiction", "isbn": "978-0451524935"},
    {"title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "category": "Fiction", "isbn": "978-0743273565"},
    {"title": "A Brief History of Time", "author": "Stephen Hawking", "category": "Science", "isbn": "978-0553380163"},
]

BORROWERS = [
    {"borrower_name": "Alice Johnson", "email": "alice@example.com", "phone": "9876543210"},
    {"borrower_name": "Bob Smith", "email": "bob@example.com", "phone": "9123456780"},
    {"borrower_name": "Carol Davis", "email": "carol@example.com", "phone": "9988776655"},
]

db = SessionLocal()

for b in BOOKS:
    if not db.query(models.Book).filter(models.Book.isbn == b["isbn"]).first():
        db.add(models.Book(**b, availability_status="available"))

for br in BORROWERS:
    if not db.query(models.Borrower).filter(models.Borrower.email == br["email"]).first():
        db.add(models.Borrower(**br))

db.commit()
db.close()
print("Sample data inserted successfully.")
