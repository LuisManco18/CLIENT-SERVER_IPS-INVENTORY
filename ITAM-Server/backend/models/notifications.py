from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime, timezone


class Notificacion(Base):
    __tablename__ = "notificaciones"

    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String, nullable=False)  # SHUTDOWN, RESTART, CANCEL
    
    # Activo afectado
    activo_id = Column(Integer, ForeignKey("activos.id"), nullable=True)
    activo_hostname = Column(String, nullable=True)
    activo_ip = Column(String, nullable=True)
    
    # Usuario que ejecutó el comando
    usuario_id = Column(Integer, ForeignKey("admins.id"), nullable=True)
    usuario_username = Column(String, nullable=True)
    
    exitoso = Column(Boolean, default=True)
    mensaje = Column(String, nullable=True)
    fecha = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Relaciones
    activo = relationship("Activo")
    usuario = relationship("UsuarioAdmin")
