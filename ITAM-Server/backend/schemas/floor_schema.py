from pydantic import BaseModel
from typing import Optional

class FloorCreate(BaseModel):
    nombre: str
    nivel: int
    edificio_id: int
    mapa_imagen: Optional[str] = None  # Base64 encoded
    mapa_filename: Optional[str] = None
    mapa_content_type: Optional[str] = None
    ancho_imagen: Optional[int] = None
    alto_imagen: Optional[int] = None

class FloorUpdate(BaseModel):
    nombre: Optional[str] = None
    nivel: Optional[int] = None
    mapa_imagen: Optional[str] = None
    mapa_filename: Optional[str] = None
    mapa_content_type: Optional[str] = None
    ancho_imagen: Optional[int] = None
    alto_imagen: Optional[int] = None

class FloorResponse(BaseModel):
    id: int
    nombre: str
    nivel: int
    edificio_id: int
    mapa_filename: Optional[str] = None
    mapa_content_type: Optional[str] = None
    ancho_imagen: Optional[int] = None
    alto_imagen: Optional[int] = None
    
    class Config:
        from_attributes = True

class FloorWithImage(FloorResponse):
    mapa_imagen: Optional[str] = None  # Solo se incluye cuando se solicita explícitamente
