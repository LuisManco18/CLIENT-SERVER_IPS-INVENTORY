from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

#postgresql://usuario:password@localhost/nombre_db
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:sql@localhost/itam_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Función para obtener la sesión en cada petición
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()