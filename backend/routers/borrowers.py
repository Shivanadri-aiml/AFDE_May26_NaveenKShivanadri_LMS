from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_db
import schemas
import crud

router = APIRouter(prefix="/borrowers", tags=["Borrowers"])


@router.get("", response_model=List[schemas.BorrowerResponse])
def list_borrowers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_borrowers(db, skip=skip, limit=limit)


@router.get("/{borrower_id}", response_model=schemas.BorrowerResponse)
def get_borrower(borrower_id: int, db: Session = Depends(get_db)):
    return crud.get_borrower(db, borrower_id)


@router.post("", response_model=schemas.BorrowerResponse, status_code=201)
def create_borrower(borrower: schemas.BorrowerCreate, db: Session = Depends(get_db)):
    return crud.create_borrower(db, borrower)


@router.put("/{borrower_id}", response_model=schemas.BorrowerResponse)
def update_borrower(borrower_id: int, borrower: schemas.BorrowerUpdate, db: Session = Depends(get_db)):
    return crud.update_borrower(db, borrower_id, borrower)


@router.delete("/{borrower_id}", status_code=204)
def delete_borrower(borrower_id: int, db: Session = Depends(get_db)):
    crud.delete_borrower(db, borrower_id)
