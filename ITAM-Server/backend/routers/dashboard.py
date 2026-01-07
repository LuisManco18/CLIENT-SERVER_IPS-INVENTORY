from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timedelta


router = APIRouter(
    prefix="/api/assets",
    tags=["Dashboard"]
)

class PositionUpdate(BaseModel):
    pos_x: float
    pos_y: float
    piso_id: int
    icono_tipo: str = None  # Opcional: desktop, laptop, server

# --- ENDPOINT 1: ESTADÍSTICAS (KPIs) ---
@router.get("/stats")
def obtener_estadisticas(db: Session = Depends(get_db)):
    # Total de equipos
    total = db.query(assets.Activo).count()
    
    # Obtener todos los activos para calcular estados
    todos_activos = db.query(assets.Activo).all()
    
    # Calcular online/offline usando el método del modelo
    online = sum(1 for activo in todos_activos if activo.is_online())
    offline = total - online
    
    # Equipos en Dominio
    dominio = db.query(assets.Activo).filter(assets.Activo.es_dominio == True).count()
    
    # Alertas (Sin usuario asignado o "No User")
    alertas = db.query(assets.Activo).filter(
        (assets.Activo.usuario_detectado == "No User") | 
        (assets.Activo.usuario_detectado == None)
    ).count()
    
    # Estadísticas por piso
    pisos_stats = {}
    pisos = db.query(assets.Activo.piso_id).distinct().all()
    for (piso_id,) in pisos:
        if piso_id:
            activos_piso = db.query(assets.Activo).filter(assets.Activo.piso_id == piso_id).all()
            online_piso = sum(1 for a in activos_piso if a.is_online())
            pisos_stats[piso_id] = {
                "total": len(activos_piso),
                "online": online_piso,
                "offline": len(activos_piso) - online_piso
            }

    return {
        "total": total,
        "online": online,
        "offline": offline,
        "en_dominio": dominio,
        "alertas": alertas,
        "por_piso": pisos_stats
    }

# --- ENDPOINT 2: LISTA COMPLETA CON FILTROS ---
@router.get("/")
def listar_activos(
    piso_id: int = None,
    solo_online: bool = None,
    solo_dominio: bool = None,
    db: Session = Depends(get_db)
):
    query = db.query(assets.Activo)
    
    # Aplicar filtros
    if piso_id is not None:
        query = query.filter(assets.Activo.piso_id == piso_id)
    
    if solo_dominio is not None:
        query = query.filter(assets.Activo.es_dominio == solo_dominio)
    
    activos = query.all()
    
    # Filtrar por estado online si se solicita
    if solo_online is not None:
        if solo_online:
            activos = [a for a in activos if a.is_online()]
        else:
            activos = [a for a in activos if not a.is_online()]
    
    # Agregar estado online a cada activo en la respuesta
    resultado = []
    for activo in activos:
        activo_dict = {
            "id": activo.id,
            "serial_number": activo.serial_number,
            "hostname": activo.hostname,
            "ip_address": activo.ip_address,
            "mac_address": activo.mac_address,
            "usuario_detectado": activo.usuario_detectado,
            "marca": activo.marca,
            "modelo": activo.modelo,
            "sistema_operativo": activo.sistema_operativo,
            "procesador": activo.procesador,
            "memoria_ram": activo.memoria_ram,
            "es_dominio": activo.es_dominio,
            "icono_tipo": activo.icono_tipo,
            "ultimo_reporte": activo.ultimo_reporte,
            "piso_id": activo.piso_id,
            "pos_x": activo.pos_x,
            "pos_y": activo.pos_y,
            "is_online": activo.is_online()
        }
        resultado.append(activo_dict)
    
    return resultado

# --- ENDPOINT 3: GUARDAR POSICIÓN EN MAPA ---
@router.put("/{serial}/position")
def guardar_posicion(serial: str, pos: PositionUpdate, db: Session = Depends(get_db)):
    activo = db.query(assets.Activo).filter(assets.Activo.serial_number == serial).first()
    
    if not activo:
        raise HTTPException(status_code=404, detail="Activo no encontrado")
    
    # Validar que el piso existe si se proporciona
    if pos.piso_id:
        from models import locations
        piso = db.query(locations.Piso).filter(locations.Piso.id == pos.piso_id).first()
        if not piso:
            raise HTTPException(status_code=404, detail="Piso no encontrado")
    
    activo.pos_x = pos.pos_x
    activo.pos_y = pos.pos_y
    activo.piso_id = pos.piso_id
    
    # Actualizar tipo de icono si se proporciona
    if pos.icono_tipo:
        activo.icono_tipo = pos.icono_tipo
    
    db.commit()
    return {"status": "updated", "serial": serial}