import requests
import json
import time
from typing import Dict, Optional
from config import settings
from logger import logger

class NetworkService:
    """
    Servicio de red con retry logic y manejo robusto de errores
    """
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'ITAM-Agent/1.0'
        })
    
    def send_report(self, data: Dict) -> bool:
        """
        Envía el reporte al servidor con reintentos automáticos
        
        Args:
            data: Diccionario con los datos del sistema
            
        Returns:
            bool: True si se envió exitosamente, False en caso contrario
        """
        if not data:
            logger.warning("No hay datos para enviar")
            return False
        
        # Agregar token de autenticación
        payload = data.copy()
        payload["auth_token"] = settings.API_TOKEN
        
        endpoint = f"{settings.API_URL}/api/report"
        
        # Intentar con reintentos
        for attempt in range(1, settings.MAX_RETRIES + 1):
            try:
                logger.info(f"Enviando reporte a {endpoint} (intento {attempt}/{settings.MAX_RETRIES})")
                
                response = self.session.post(
                    endpoint,
                    json=payload,
                    timeout=settings.REQUEST_TIMEOUT
                )
                
                # Verificar respuesta
                if response.status_code == 200:
                    result = response.json()
                    logger.info(f"✓ Reporte enviado exitosamente: {result.get('hostname', 'N/A')}")
                    logger.debug(f"Respuesta del servidor: {result}")
                    return True
                
                elif response.status_code == 401:
                    logger.error("✗ Error de autenticación: Token inválido")
                    logger.error("Verifica que el API_TOKEN coincida con el del servidor")
                    return False  # No reintentar en errores de autenticación
                
                elif response.status_code == 422:
                    logger.error(f"✗ Error de validación: {response.json()}")
                    return False  # No reintentar en errores de validación
                
                else:
                    logger.warning(f"Servidor respondió con código {response.status_code}")
                    logger.debug(f"Respuesta: {response.text}")
                    
            except requests.exceptions.ConnectionError as e:
                logger.warning(f"✗ No se pudo conectar al servidor: {e}")
                logger.info("Verifica que el servidor esté ejecutándose")
                
            except requests.exceptions.Timeout:
                logger.warning(f"✗ Timeout al conectar con el servidor ({settings.REQUEST_TIMEOUT}s)")
                
            except requests.exceptions.RequestException as e:
                logger.error(f"✗ Error de red: {e}")
                
            except Exception as e:
                logger.error(f"✗ Error inesperado: {e}", exc_info=True)
            
            # Esperar antes de reintentar (excepto en el último intento)
            if attempt < settings.MAX_RETRIES:
                wait_time = settings.RETRY_DELAY * attempt  # Backoff exponencial
                logger.info(f"Reintentando en {wait_time} segundos...")
                time.sleep(wait_time)
        
        logger.error(f"✗ No se pudo enviar el reporte después de {settings.MAX_RETRIES} intentos")
        return False
    
    def test_connection(self) -> bool:
        """
        Prueba la conexión con el servidor
        
        Returns:
            bool: True si el servidor está accesible
        """
        try:
            health_endpoint = f"{settings.API_URL}/"
            logger.info(f"Probando conexión con {health_endpoint}")
            
            response = self.session.get(health_endpoint, timeout=5)
            
            if response.status_code == 200:
                logger.info("✓ Servidor accesible")
                return True
            else:
                logger.warning(f"Servidor respondió con código {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"✗ No se pudo conectar al servidor: {e}")
            return False
    
    def close(self):
        """Cierra la sesión de requests"""
        self.session.close()

# Función de compatibilidad con código anterior
def send_report(data: Dict) -> bool:
    """Wrapper para compatibilidad con versiones anteriores"""
    service = NetworkService()
    result = service.send_report(data)
    service.close()
    return result