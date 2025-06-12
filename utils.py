import bcrypt
import os
from cryptography.fernet import Fernet
from dotenv import load_dotenv
from datetime import datetime, timedelta
from jose import JWTError, jwt


load_dotenv()

fernet_key = os.getenv("FERNET_KEY").encode()
fernet = Fernet(fernet_key)
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))


def encrypt_data(plain_text: str) -> str:
    return fernet.encrypt(plain_text.encode()).decode()

def decrypt_data(encrypted_text: str) -> str:
    return fernet.decrypt(encrypted_text.encode()).decode()

def hash_password(plain_password: str) -> str:
    return bcrypt.hashpw(plain_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp":expire})
    return jwt.encode(to_encode,SECRET_KEY,algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token,SECRET_KEY,algorithms=ALGORITHM)
        return payload
    except JWTError:
        return None
    
    