from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_db
import schemas
import crud

router = APIRouter(tags=["Transactions"])


@router.post("/borrow", response_model=schemas.TransactionResponse, status_code=201)
def borrow_book(borrow: schemas.BorrowRequest, db: Session = Depends(get_db)):
    return crud.borrow_book(db, borrow)


@router.post("/return", response_model=schemas.TransactionResponse)
def return_book(return_req: schemas.ReturnRequest, db: Session = Depends(get_db)):
    return crud.return_book(db, return_req)


@router.get("/transactions", response_model=List[schemas.TransactionResponse])
def list_transactions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_transactions(db, skip=skip, limit=limit)
