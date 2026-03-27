"""
Authentication router - Login and user management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models import users
from models.permisos import PermisoUsuario
from schemas import auth_schema
from auth_utils import verify_password, create_access_token, verify_token
from datetime import datetime, timezone

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
security = HTTPBearer()

@router.post("/login", response_model=auth_schema.TokenResponse)
def login(credentials: auth_schema.LoginRequest, db: Session = Depends(get_db)):
    """
    Endpoint de login
    Verifica credenciales y retorna JWT token
    """
    # Buscar usuario
    user = db.query(users.UsuarioAdmin).filter(
        users.UsuarioAdmin.username == credentials.username
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos"
        )
    
    # Verificar contraseña
    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos"
        )
    
    # Verificar que esté activo
    if not user.es_activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo"
        )
    
    # Actualizar último login
    user.ultimo_login = datetime.now(timezone.utc)
    db.commit()
    
    # Crear token
    access_token = create_access_token(
        data={"sub": user.username, "user_id": user.id, "es_superadmin": user.es_superadmin}
    )
    
    # Obtener permisos del usuario
    permisos = []
    if not user.es_superadmin:  # Superadmin no necesita permisos específicos
        permisos_db = db.query(PermisoUsuario).options(
            joinedload(PermisoUsuario.edificio),
            joinedload(PermisoUsuario.piso)
        ).filter(PermisoUsuario.usuario_id == user.id).all()
        
        for p in permisos_db:
            permisos.append({
                "edificio_id": p.edificio_id,
                "edificio_nombre": p.edificio.nombre if p.edificio else None,
                "piso_id": p.piso_id,
                "piso_nombre": p.piso.nombre if p.piso else None
            })
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username,
        "nombre_completo": user.nombre_completo,
        "es_superadmin": user.es_superadmin,
        "permisos": permisos,
        "perm_dashboard": True if user.es_superadmin else (user.perm_dashboard if user.perm_dashboard is not None else True),
        "perm_inventario": True if user.es_superadmin else (user.perm_inventario if user.perm_inventario is not None else True),
        "perm_mapa": True if user.es_superadmin else (user.perm_mapa if user.perm_mapa is not None else True),
        "perm_mapa_editar": True if user.es_superadmin else (user.perm_mapa_editar if user.perm_mapa_editar is not None else True),
        "perm_edificios": True if user.es_superadmin else (user.perm_edificios if user.perm_edificios is not None else True),
        "perm_impresiones": True if user.es_superadmin else (user.perm_impresiones if user.perm_impresiones is not None else True),
        "perm_usuarios": True if user.es_superadmin else (user.perm_usuarios if user.perm_usuarios is not None else False),
        "perm_notificaciones": True if user.es_superadmin else (user.perm_notificaciones if user.perm_notificaciones is not None else True),
    }

@router.get("/me")
def get_current_user_me(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Obtiene informacion del usuario actual con todos sus permisos
    Requiere token JWT valido
    """
    token = credentials.credentials
    payload = verify_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalido o expirado"
        )
    
    username = payload.get("sub")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalido"
        )
    
    user = db.query(users.UsuarioAdmin).filter(
        users.UsuarioAdmin.username == username
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    # Build permisos list for non-superadmin
    permisos = []
    if not user.es_superadmin:
        permisos_db = db.query(PermisoUsuario).options(
            joinedload(PermisoUsuario.edificio),
            joinedload(PermisoUsuario.piso)
        ).filter(PermisoUsuario.usuario_id == user.id).all()
        
        for p in permisos_db:
            permisos.append({
                "edificio_id": p.edificio_id,
                "edificio_nombre": p.edificio.nombre if p.edificio else None,
                "piso_id": p.piso_id,
                "piso_nombre": p.piso.nombre if p.piso else None
            })

    # Return full user data including all section permissions
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "nombre_completo": user.nombre_completo,
        "es_activo": user.es_activo,
        "es_admin": user.es_admin,
        "es_superadmin": user.es_superadmin,
        "ultimo_login": str(user.ultimo_login) if user.ultimo_login else None,
        "permisos": permisos,
        "perm_dashboard": True if user.es_superadmin else (user.perm_dashboard if user.perm_dashboard is not None else True),
        "perm_inventario": True if user.es_superadmin else (user.perm_inventario if user.perm_inventario is not None else True),
        "perm_mapa": True if user.es_superadmin else (user.perm_mapa if user.perm_mapa is not None else True),
        "perm_mapa_editar": True if user.es_superadmin else (user.perm_mapa_editar if user.perm_mapa_editar is not None else True),
        "perm_edificios": True if user.es_superadmin else (user.perm_edificios if user.perm_edificios is not None else True),
        "perm_impresiones": True if user.es_superadmin else (user.perm_impresiones if user.perm_impresiones is not None else True),
        "perm_usuarios": True if user.es_superadmin else (user.perm_usuarios if user.perm_usuarios is not None else False),
        "perm_notificaciones": True if user.es_superadmin else (user.perm_notificaciones if user.perm_notificaciones is not None else True),
    }

@router.post("/logout")
def logout():
    """
    Endpoint de logout
    En implementacion JWT stateless, el logout se maneja en el cliente
    """
    return {"message": "Logout exitoso"}
