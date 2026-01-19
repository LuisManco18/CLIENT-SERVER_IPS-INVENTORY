from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session
from database import get_db
from models.assets import Activo
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import pandas as pd
import io
from datetime import datetime

router = APIRouter(
    prefix="/api/reports",
    tags=["Reports"]
)

@router.get("/pdf")
def generate_pdf_report(db: Session = Depends(get_db)):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []
    
    styles = getSampleStyleSheet()
    elements.append(Paragraph(f"Reporte de Inventario - {datetime.now().strftime('%Y-%m-%d')}", styles['Title']))
    elements.append(Spacer(1, 12))
    
    # Fetch Data
    activos = db.query(Activo).all()
    
    data = [['Hostname', 'Estado', 'Area', 'IP Address', 'Usuario']]
    for a in activos:
        estado = "Online" if a.is_online() else "Offline"
        data.append([
            a.hostname or "N/A", 
            estado, 
            a.area or "N/A", 
            a.ip_address or "N/A", 
            a.usuario_detectado or "N/A"
        ])
        
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    
    elements.append(table)
    doc.build(elements)
    
    buffer.seek(0)
    return StreamingResponse(
        buffer, 
        media_type='application/pdf', 
        headers={"Content-Disposition": "attachment; filename=reporte_inventario.pdf"}
    )

@router.get("/excel")
def generate_excel_report(db: Session = Depends(get_db)):
    activos = db.query(Activo).all()
    
    data = []
    for a in activos:
        data.append({
            "Hostname": a.hostname,
            "Estado": "Online" if a.is_online() else "Offline",
            "Area": a.area,
            "Dominio": "Si" if a.es_dominio else "No",
            "IP Address": a.ip_address,
            "MAC Address": a.mac_address,
            "Usuario": a.usuario_detectado,
            "Marca": a.marca,
            "OS": a.sistema_operativo,
            "Ultimo Reporte": a.ultimo_reporte
        })
        
    df = pd.DataFrame(data)
    
    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name="Inventario")
        
    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        headers={"Content-Disposition": "attachment; filename=reporte_inventario.xlsx"}
    )
