print("database.py is running")

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker , declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL=os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL , echo=True)

SessionLocal = sessionmaker(autocommit=False , autoflush=False, bind=engine)

Base=declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
        db.commit()  # Optional for GET, safe to keep
    except:
        db.rollback()
        raise
    finally:
        db.close()