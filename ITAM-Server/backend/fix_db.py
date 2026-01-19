import sys
import os
from sqlalchemy import text
from sqlalchemy.exc import ProgrammingError

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, SessionLocal, Base
from models import assets, history, models  # Ensure all models are imported
from init_db import load_initial_catalogs, load_initial_buildings

def fix_database():
    db = SessionLocal()
    print("🔧 Iniciando reparación de base de datos...")

    # 1. Agregar columna AREA a la tabla ACTIVOS si no existe
    try:
        print("Checking 'area' column in 'activos'...")
        db.execute(text("ALTER TABLE activos ADD COLUMN IF NOT EXISTS area VARCHAR"))
        db.commit()
        print("✓ Columna 'area' verificada/agregada.")
    except Exception as e:
        print(f"Error checking column: {e}")
        db.rollback()

    # 2. Re-crear tablas faltantes (especialmente historial_activos y naming_conventions)
    print("Checking tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✓ create_all ejecutado.")
    except Exception as e:
        print(f"Error en create_all: {e}")

    # 3. Cargar Catálogos
    try:
        load_initial_catalogs(db)
        print("✓ Catálogos cargados.")
    except Exception as e:
        print(f"Error cargando catálogos: {e}")

    # 4. Cargar Edificios Custom
    try:
        load_initial_buildings(db)
        print("✓ Edificios cargados.")
    except Exception as e:
        print(f"Error cargando edificios: {e}")

    db.close()
    print("\n✅ Reparación completada. Reinicia el backend.")

if __name__ == "__main__":
    fix_database()
