"""
Router para notificaciones de comandos remotos
Muestra historial de apagados/reinicios ejecutados por usuarios
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from database import get_db
from models.notifications import Notificacion
from dependencies import get_current_user

router = APIRouter(
    prefix="/api/notificaciones",
    tags=["Notificaciones"],
    dependencies=[Depends(get_current_user)]
)


class NotificacionResponse(BaseModel):
    id: int
    tipo: str
    activo_hostname: Optional[str] = None
    activo_ip: Optional[str] = None
    usuario_username: Optional[str] = None
    exitoso: bool
    mensaje: Optional[str] = None
    fecha: Optional[datetime] = None

    class Config:
        from_attributes = True


@router.get("/", response_model=List[NotificacionResponse])
def listar_notificaciones(
    tipo: Optional[str] = None,
    limit: int = Query(default=100, le=500),
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Lista notificaciones con filtros opcionales"""
    query = db.query(Notificacion).order_by(desc(Notificacion.fecha))

    if tipo:
        query = query.filter(Notificacion.tipo == tipo.upper())

    total = query.count()
    items = query.offset(offset).limit(limit).all()

    return items


@router.get("/count")
def contar_notificaciones(db: Session = Depends(get_db)):
    """Devuelve el total de notificaciones (para badge)"""
    total = db.query(Notificacion).count()
    return {"total": total}
