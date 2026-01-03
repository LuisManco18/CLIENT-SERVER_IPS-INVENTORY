# ITAM Agent - Agente de Inventario

## Descripción

Agente de inventario automático para Windows que recolecta información de hardware y software del equipo y la envía al servidor central ITAM.

## Características

- ✅ **Recolección automática** de datos mediante WMI
- ✅ **Arquitectura MVC** para código mantenible
- ✅ **Retry logic** con backoff exponencial
- ✅ **Logging robusto** con rotación de archivos
- ✅ **Configuración flexible** (archivo JSON + variables de entorno)
- ✅ **Modo silencioso** para ejecución en background
- ✅ **Graceful shutdown** con manejo de señales

## Instalación

### 1. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 2. Configurar el agente

Copia el archivo de configuración de ejemplo:

```bash
copy config.json.example config.json
```

Edita `config.json` con los valores correctos:

```json
{
  "api_url": "http://TU_SERVIDOR:8000",
  "api_token": "TU_TOKEN_AQUI",
  "report_interval": 300
}
```

## Uso

### Modo normal (continuo)

```bash
python src/main.py
```

### Ejecutar una sola vez (testing)

```bash
python src/main.py --once
```

### Probar conexión con el servidor

```bash
python src/main.py --test-connection
```

### Ver ayuda

```bash
python src/main.py --help
```

## Configuración

### Variables de entorno

Puedes usar variables de entorno en lugar del archivo de configuración:

- `ITAM_API_URL`: URL del servidor
- `ITAM_API_TOKEN`: Token de autenticación
- `ITAM_REPORT_INTERVAL`: Intervalo en segundos (default: 300)
- `ITAM_REQUEST_TIMEOUT`: Timeout de requests en segundos (default: 30)
- `ITAM_MAX_RETRIES`: Número máximo de reintentos (default: 3)
- `ITAM_RETRY_DELAY`: Delay entre reintentos en segundos (default: 5)
- `ITAM_SILENT_MODE`: Modo silencioso (true/false, default: true)

### Archivo de configuración

El archivo `config.json` tiene prioridad sobre las variables de entorno.

## Datos recolectados

El agente recolecta la siguiente información:

- **Serial Number** (BIOS) - Identificador único
- **Hostname** y **Usuario** logueado
- **Marca** y **Modelo** del equipo
- **RAM** (en GB) y **Procesador**
- **Sistema Operativo**
- **Dirección IP** y **MAC**

## Logs

Los logs se guardan en la carpeta `logs/`:

- `itam_agent.log` - Log principal
- Rotación automática cada 5 MB
- Se mantienen 3 archivos de backup

## Compilar a .exe

Para distribuir el agente como ejecutable:

```bash
pip install pyinstaller
pyinstaller --onefile --noconsole src/main.py
```

El ejecutable se generará en `dist/main.exe`.

## Arquitectura

```
src/
├── main.py         # Controller - Lógica principal
├── collector.py    # Model - Recolección de datos
├── network.py      # Service - Comunicación con servidor
├── config.py       # Configuration - Gestión de configuración
└── logger.py       # View - Sistema de logging
```

## Troubleshooting

### Error: "No se pudo conectar al servidor"

- Verifica que el servidor esté ejecutándose
- Verifica la URL en la configuración
- Verifica que no haya firewall bloqueando la conexión

### Error: "Token inválido"

- Verifica que el `api_token` coincida con el del servidor
- Revisa el archivo `.env` del servidor

### Error de WMI

- Ejecuta como Administrador
- Verifica que el servicio WMI esté ejecutándose:
  ```
  net start winmgmt
  ```

## Licencia

Uso interno - Sistema ITAM
