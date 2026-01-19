from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class HistoryBase(BaseModel):
    campo_modificado: str
    valor_anterior: Optional[str] = None
    valor_nuevo: Optional[str] = None
    fecha_cambio: datetime
    # usuario: Optional[str] = None # Si queremos mostrar quién hizo el cambio

    class Config:
        from_attributes = True

class HistoryResponse(HistoryBase):
    id: int
    activo_id: int

# ... existing code ...
