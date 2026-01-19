from pydantic import BaseModel
from typing import Optional

class GlossaryBase(BaseModel):
    category: str
    code: str
    description: str

class GlossaryCreate(GlossaryBase):
    pass

class GlossaryUpdate(BaseModel):
    category: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None

class GlossaryResponse(GlossaryBase):
    id: int

    class Config:
        from_attributes = True
