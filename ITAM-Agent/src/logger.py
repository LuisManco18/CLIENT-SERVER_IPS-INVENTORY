import logging
import sys
from logging.handlers import RotatingFileHandler
from pathlib import Path

def setup_logger(name='ITAM-Agent', log_file='itam_agent.log', level=logging.INFO):
    """
    Configura el sistema de logging con rotación de archivos
    """
    # Crear directorio de logs si no existe
    log_dir = Path('logs')
    log_dir.mkdir(exist_ok=True)
    log_path = log_dir / log_file
    
    # Crear logger
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Evitar duplicados
    if logger.handlers:
        return logger
    
    # Formato detallado
    formatter = logging.Formatter(
        '%(asctime)s | %(levelname)-8s | %(name)s | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Handler para archivo (con rotación)
    file_handler = RotatingFileHandler(
        log_path,
        maxBytes=5*1024*1024,  # 5 MB
        backupCount=3,
        encoding='utf-8'
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)
    
    # Handler para consola (solo INFO y superior)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_formatter = logging.Formatter(
        '%(asctime)s | %(levelname)-8s | %(message)s',
        datefmt='%H:%M:%S'
    )
    console_handler.setFormatter(console_formatter)
    
    # Agregar handlers
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger

# Logger global
logger = setup_logger()
