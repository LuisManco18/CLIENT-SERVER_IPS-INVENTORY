from pydantic import BaseModel
from typing import Optional, List

# Base Schema
class AreaBase(BaseModel):
    nombre: str
    piso_id: int
    coordenadas_json: Optional[str] = None

# Create Schema
class AreaCreate(AreaBase):
    pass

# Update Schema
class AreaUpdate(BaseModel):
    nombre: Optional[str] = None
    piso_id: Optional[int] = None
    coordenadas_json: Optional[str] = None

# Response Schema
class AreaResponse(AreaBase):
    id: int
    
    class Config:
        from_attributes = True
