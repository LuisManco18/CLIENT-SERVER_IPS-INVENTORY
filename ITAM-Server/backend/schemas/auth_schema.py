"""
Authentication schemas for API requests/responses
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime

class LoginRequest(BaseModel):
    """Schema para solicitud de login"""
    username: str
    password: str

class PermisoLogin(BaseModel):
    """Permiso incluido en respuesta de login"""
    edificio_id: int
    edificio_nombre: Optional[str] = None
    piso_id: Optional[int] = None
    piso_nombre: Optional[str] = None

class TokenResponse(BaseModel):
    """Schema para respuesta de token"""
    access_token: str
    token_type: str = "bearer"
    username: str
    nombre_completo: Optional[str] = None
    es_superadmin: bool = False
    permisos: List[PermisoLogin] = []
    # Permisos por sección
    perm_dashboard: bool = True
    perm_inventario: bool = True
    perm_mapa: bool = True
    perm_mapa_editar: bool = True
    perm_edificios: bool = True
    perm_impresiones: bool = True
    perm_usuarios: bool = False
    perm_notificaciones: bool = True

class UserResponse(BaseModel):
    """Schema para información de usuario"""
    id: int
    username: str
    email: Optional[str] = None
    nombre_completo: Optional[str] = None
    es_activo: bool
    es_admin: bool
    es_superadmin: bool = False
    ultimo_login: Optional[datetime] = None
    # Permisos por sección
    perm_dashboard: bool = True
    perm_inventario: bool = True
    perm_mapa: bool = True
    perm_mapa_editar: bool = True
    perm_edificios: bool = True
    perm_impresiones: bool = True
    perm_usuarios: bool = False
    perm_notificaciones: bool = True

    class Config:
        from_attributes = True

