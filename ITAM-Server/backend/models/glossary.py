from sqlalchemy import Column, Integer, String
from database import Base

class NamingConvention(Base):
    """
    Glossary of abbreviations for parsing hostnames.
    Categories: DISTRITO, SEDE, TIPO, OOJJ, AREA
    """
    __tablename__ = "naming_conventions"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True, nullable=False) # e.g., "DISTRITO", "AREA"
    code = Column(String, index=True, nullable=False)     # e.g., "04", "SA"
    description = Column(String, nullable=False)          # e.g., "Corte de Arequipa", "Sala de Audiencias"
