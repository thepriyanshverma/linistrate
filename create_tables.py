# this is create table , which is being run onlyu once
from database import Base , engine
from models import User, Asset , CommandRequest

print("Creating tables")
Base.metadata.create_all(bind=engine)
print("Table creation done")