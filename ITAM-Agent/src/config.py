class ClientSettings:
    # Si el servidor está en tu misma PC, usa "localhost".
    # Si está en otra PC, pon la IP de esa PC (ej: "http://192.168.1.50:8000")
    API_URL = "http://localhost:8000"
    
    # Debe coincidir con el API_TOKEN que pusiste en el .env del servidor
    API_TOKEN = "sk_live_token_maestro_para_agentes"
    
    # Tiempo entre reportes (en segundos). 
    # 300 segundos = 5 minutos. Ponemos 10 para pruebas rápidas.
    REPORT_INTERVAL = 10 

settings = ClientSettings()