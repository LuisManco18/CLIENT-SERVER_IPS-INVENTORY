from sqlalchemy.orm import Session
from models.history import HistorialActivo
from typing import Optional

def log_asset_change(db: Session, asset_id: int, field: str, old_val: Optional[str], new_val: Optional[str], user_id: Optional[int] = None):
    """
    Registra un cambio en el historial del activo si el valor ha cambiado.
    """
    # Convertir a string para comparación segura, manejando None
    str_old = str(old_val) if old_val is not None else ""
    str_new = str(new_val) if new_val is not None else ""
    
    if str_old != str_new:
        nuevo_registro = HistorialActivo(
            activo_id=asset_id,
            campo_modificado=field,
            valor_anterior=str(old_val) if old_val is not None else None,
            valor_nuevo=str(new_val) if new_val is not None else None,
            usuario_id=user_id
        )
        db.add(nuevo_registro)
        # Nota: El commit debe hacerse en la función llamadora para atomicidad, 
        # o aquí si se prefiere inmediato. Lo dejaremos pendiente de commit.
