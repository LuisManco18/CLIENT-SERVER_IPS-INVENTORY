import os
import json
from pathlib import Path
from typing import Optional

class ClientSettings:
    """
    Configuración del agente ITAM
    Soporta variables de entorno y archivo de configuración
    """
    
    def __init__(self):
        # Cargar desde archivo de configuración si existe
        self.config_file = Path('config.json')
        config_data = self._load_config_file()
        
        # Configuración del servidor
        self.API_URL = os.getenv('ITAM_API_URL', config_data.get('api_url', 'http://localhost:8000'))
        self.API_TOKEN = os.getenv('ITAM_API_TOKEN', config_data.get('api_token', 'sk_live_token_maestro_para_agentes'))
        
        # Intervalo de reporte (en segundos)
        # 300 segundos = 5 minutos
        self.REPORT_INTERVAL = int(os.getenv('ITAM_REPORT_INTERVAL', config_data.get('report_interval', 300)))
        
        # Configuración de red
        self.REQUEST_TIMEOUT = int(os.getenv('ITAM_REQUEST_TIMEOUT', config_data.get('request_timeout', 30)))
        self.MAX_RETRIES = int(os.getenv('ITAM_MAX_RETRIES', config_data.get('max_retries', 3)))
        self.RETRY_DELAY = int(os.getenv('ITAM_RETRY_DELAY', config_data.get('retry_delay', 5)))
        
        # Modo silencioso (sin ventanas)
        self.SILENT_MODE = os.getenv('ITAM_SILENT_MODE', config_data.get('silent_mode', 'true')).lower() == 'true'
        
        # Validar configuración
        self._validate()
    
    def _load_config_file(self) -> dict:
        """Carga configuración desde archivo JSON si existe"""
        if self.config_file.exists():
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print(f"Warning: No se pudo cargar config.json: {e}")
        return {}
    
    def _validate(self):
        """Valida la configuración"""
        if not self.API_URL:
            raise ValueError("API_URL no puede estar vacío")
        
        if not self.API_TOKEN:
            raise ValueError("API_TOKEN no puede estar vacío")
        
        if self.REPORT_INTERVAL < 10:
            raise ValueError("REPORT_INTERVAL debe ser al menos 10 segundos")
    
    def save_config_template(self):
        """Guarda un archivo de configuración de ejemplo"""
        template = {
            "api_url": "http://localhost:8000",
            "api_token": "sk_live_token_maestro_para_agentes",
            "report_interval": 300,
            "request_timeout": 30,
            "max_retries": 3,
            "retry_delay": 5,
            "silent_mode": True
        }
        
        template_file = Path('config.json.example')
        with open(template_file, 'w', encoding='utf-8') as f:
            json.dump(template, f, indent=2)
        
        print(f"Archivo de configuración de ejemplo creado: {template_file}")
    
    def __repr__(self):
        return f"<ClientSettings API_URL={self.API_URL} INTERVAL={self.REPORT_INTERVAL}s>"

# Instancia global
settings = ClientSettings()