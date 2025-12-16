from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from ..database import get_db
from ..models import assets

router = APIRouter(
    prefix="/api/assets",
    tags=["Dashboard"]
)

# Esquema para actualizar la posición en el mapa
class PositionUpdate(BaseModel):
    pos_x: float
    pos_y: float
    piso_id: int

@router.get("/")
def listar_activos(db: Session = Depends(get_db)):
    """Devuelve la lista completa de activos para la tabla"""
    return db.query(assets.Activo).all()

@router.put("/{serial}/position")
def guardar_posicion(serial: str, pos: PositionUpdate, db: Session = Depends(get_db)):
    """Guarda las coordenadas X,Y cuando arrastras el ícono en el mapa"""
    activo = db.query(assets.Activo).filter(assets.Activo.serial_number == serial).first()
    
    if not activo:
        raise HTTPException(status_code=404, detail="Activo no encontrado")
    
    activo.pos_x = pos.pos_x
    activo.pos_y = pos.pos_y
    activo.piso_id = pos.piso_id
    db.commit()
    return {"status": "updated", "serial": serial}