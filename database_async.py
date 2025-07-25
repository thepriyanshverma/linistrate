print("database.py is running...")

from sqlalchemy.ext.asyncio import create_async_engine,AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL=os.getenv("DATABASE_URL")

print("DATABASE_URL =", repr(DATABASE_URL))


engine = create_async_engine(DATABASE_URL, echo=True, connect_args={"ssl": "require"})

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base= declarative_base()


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session