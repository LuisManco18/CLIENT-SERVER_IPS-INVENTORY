from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
from models.users import UsuarioAdmin

class HistorialActivo(Base):
    __tablename__ = "historial_activos"
    
    id = Column(Integer, primary_key=True, index=True)
    activo_id = Column(Integer, ForeignKey("activos.id"))
    usuario_id = Column(Integer, ForeignKey("admins.id"), nullable=True) # ID del admin que hizo el cambio (si aplica)
    
    campo_modificado = Column(String) # Ej: "hostname", "piso_id"
    valor_anterior = Column(String, nullable=True)
    valor_nuevo = Column(String, nullable=True)
    
    fecha_cambio = Column(DateTime, default=datetime.utcnow)
    
    activo = relationship("Activo", back_populates="historial")
    usuario = relationship("UsuarioAdmin") # Relación opcional
