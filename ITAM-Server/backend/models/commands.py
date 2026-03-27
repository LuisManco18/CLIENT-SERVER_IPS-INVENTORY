"""
Tabla de comandos pendientes para agentes ITAM.
Arquitectura PULL: el agente consulta al servidor si hay comandos, en lugar de que el servidor llame al agente.
Esto permite funcionar sin necesidad de que el servidor pueda alcanzar al agente directamente.
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from database import Base


class ComandoPendiente(Base):
    __tablename__ = "comandos_pendientes"

    id = Column(Integer, primary_key=True, index=True)
    # Quién debe ejecutar el comando
    activo_id = Column(Integer, ForeignKey("activos.id"), nullable=False, index=True)
    serial_number = Column(String(100), nullable=False, index=True)  # Para búsqueda rápida por serial
    hostname = Column(String(200), nullable=True)

    # El comando a ejecutar
    tipo = Column(String(20), nullable=False)  # SHUTDOWN | RESTART | CANCEL
    delay_segundos = Column(Integer, default=60)

    # Estado del ciclo de vida
    estado = Column(String(20), default="PENDIENTE", index=True)
    # PENDIENTE → EJECUTADO | FALLIDO | CANCELADO

    # Quién lo envió
    usuario_id = Column(Integer, ForeignKey("admins.id"), nullable=True)
    usuario_username = Column(String(100), nullable=True)

    # Timestamps
    creado_en = Column(DateTime(timezone=True), server_default=func.now())
    ejecutado_en = Column(DateTime(timezone=True), nullable=True)
    mensaje_resultado = Column(String(500), nullable=True)
