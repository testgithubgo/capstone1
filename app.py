from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import sqlite3
from datetime import date
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

DATABASE = 'expenses.db'

class ExpenseCreate(BaseModel):
    name: str
    amount: float
    date: date
    category: str

class Expense(BaseModel):
    id: int
    name: str
    amount: float
    date: date
    category: str

def init_db():
    with sqlite3.connect(DATABASE) as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS expenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                amount REAL NOT NULL,
                date TEXT NOT NULL,
                category TEXT NOT NULL
            )
        ''')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for simplicity, adjust as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()

@app.post("/add_expense")
def add_expense(expense: ExpenseCreate):
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO expenses (name, amount, date, category)
            VALUES (?, ?, ?, ?)
        ''', (expense.name, expense.amount, expense.date.isoformat(), expense.category))
        conn.commit()
        return {"success": True}

@app.get("/get_expenses", response_model=List[Expense])
def get_expenses():
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM expenses')
        expenses = cursor.fetchall()
        return [
            Expense(
                id=row[0],
                name=row[1],
                amount=row[2],
                date=date.fromisoformat(row[3]),
                category=row[4]
            ) for row in expenses
        ]

@app.put("/update_expense/{expense_id}")
def update_expense(expense_id: int, expense: ExpenseCreate):
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE expenses
            SET name = ?, amount = ?, date = ?, category = ?
            WHERE id = ?
        ''', (expense.name, expense.amount, expense.date.isoformat(), expense.category, expense_id))
        conn.commit()
        return {"success": True}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
