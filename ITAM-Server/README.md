# ITAM Server - Sistema de Gestión de Activos TI

## Descripción

Plataforma web cliente-servidor para inventariar computadoras, monitorear su estado en tiempo real y ubicarlas en mapas físicos interactivos.

## Características Principales

### 🖥️ Vista de Inventario
- Tabla interactiva con todos los equipos
- Búsqueda y filtrado en tiempo real
- Indicadores de estado (Online/Offline)
- Exportación a CSV
- Actualización automática cada 30 segundos

### 🗺️ Vista de Mapa Físico
- Mapas interactivos por piso
- Drag & drop para ubicar equipos
- Zoom y controles de navegación
- Tooltips con información detallada
- Persistencia de posiciones en BD

### 📊 Dashboard de Estadísticas
- Total de equipos
- Equipos Online/Offline
- Equipos en dominio
- Alertas de equipos sin usuario
- Estadísticas por piso

### 🏢 Gestión de Pisos
- Crear/editar/eliminar pisos
- Subir planos de piso (imágenes)
- Almacenamiento en base de datos
- Soporte para múltiples edificios

## Tecnologías

### Backend
- **FastAPI** - Framework web moderno
- **PostgreSQL** - Base de datos relacional
- **SQLAlchemy** - ORM
- **Pydantic** - Validación de datos
- **Pillow** - Procesamiento de imágenes

### Frontend
- **React 19** - Framework UI
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animaciones
- **React Draggable** - Drag & drop
- **Axios** - HTTP client

### Infraestructura
- **Docker** - Containerización
- **Docker Compose** - Orquestación

## Instalación

### Prerrequisitos

- Docker Desktop instalado
- Git

### 1. Clonar el repositorio

```bash
git clone <repo-url>
cd CLIENT-SERVER_IPS-INVENTORY/ITAM-Server
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo:

```bash
copy .env.example .env
```

Edita `.env` y configura tus valores:

```env
DB_PASSWORD=tu_password_seguro
API_TOKEN=tu_token_seguro
```

### 3. Iniciar los servicios

```bash
docker-compose up -d
```

Esto iniciará:
- **PostgreSQL** en puerto 5432
- **Backend** en puerto 8000
- **Frontend** en puerto 5173

### 4. Acceder a la aplicación

Abre tu navegador en: http://localhost:5173

## Estructura del Proyecto

```
ITAM-Server/
├── backend/
│   ├── models/          # Modelos de base de datos
│   │   ├── assets.py    # Modelo de activos
│   │   └── locations.py # Modelo de pisos/edificios
│   ├── routers/         # Endpoints de la API
│   │   ├── dashboard.py # Endpoints de inventario
│   │   └── floors.py    # Endpoints de pisos
│   ├── schemas/         # Esquemas de validación
│   ├── main.py          # Punto de entrada
│   ├── database.py      # Configuración de BD
│   └── config.py        # Configuración
├── frontend/
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── hooks/       # Custom hooks
│   │   ├── App.jsx      # Componente principal
│   │   └── index.css    # Estilos globales
│   └── public/
│       └── planos/      # Imágenes de planos
└── docker-compose.yml   # Configuración Docker
```

## API Endpoints

### Assets (Inventario)

- `GET /api/assets` - Listar todos los activos
  - Query params: `piso_id`, `solo_online`, `solo_dominio`
- `GET /api/assets/stats` - Obtener estadísticas
- `PUT /api/assets/{serial}/position` - Actualizar posición en mapa
- `POST /api/report` - Recibir reporte de agente (interno)

### Floors (Pisos)

- `GET /api/floors` - Listar pisos
- `GET /api/floors/{id}` - Obtener detalles de piso
- `GET /api/floors/{id}/image` - Obtener imagen del plano
- `POST /api/floors` - Crear piso con imagen
- `PUT /api/floors/{id}` - Actualizar piso
- `DELETE /api/floors/{id}` - Eliminar piso

## Uso

### 1. Crear un piso

1. Haz clic en el botón de configuración (🏢) en el header
2. Completa el formulario con nombre y nivel
3. Arrastra una imagen del plano o haz clic para seleccionar
4. Haz clic en "Crear Piso"

### 2. Ubicar equipos en el mapa

1. Ve a la vista "Mapa Físico"
2. Selecciona el piso en el dropdown
3. Arrastra los iconos de los equipos a sus ubicaciones reales
4. Las posiciones se guardan automáticamente

### 3. Monitorear equipos

- Los equipos que reportaron en los últimos 5 minutos aparecen como **Online** (🟢)
- Los equipos sin reporte reciente aparecen como **Offline** (🔴)
- El dashboard se actualiza automáticamente cada 30 segundos

### 4. Exportar inventario

1. Ve a la vista "Inventario"
2. Aplica filtros si es necesario
3. Haz clic en "Exportar CSV"

## Desarrollo

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Base de datos

Para acceder a la base de datos directamente:

```bash
docker exec -it itam_db psql -U postgres -d itam_db
```

## Configuración de Agentes

Los agentes deben configurarse con:

```json
{
  "api_url": "http://IP_DEL_SERVIDOR:8000",
  "api_token": "EL_MISMO_TOKEN_DEL_.ENV"
}
```

Ver documentación del agente en `ITAM-Agent/README.md`

## Troubleshooting

### El frontend no se conecta al backend

- Verifica que el backend esté corriendo: http://localhost:8000
- Verifica la variable `VITE_API_URL` en el `.env`

### Los equipos no aparecen en el mapa

- Verifica que tengan `piso_id` asignado
- Verifica que hayas seleccionado el piso correcto

### Error al subir imagen de plano

- Verifica que la imagen sea PNG, JPG o GIF
- Verifica que no exceda 10 MB

## Producción

Para desplegar en producción:

1. Cambia `allow_origins=["*"]` en `main.py` por tu dominio
2. Usa contraseñas seguras en `.env`
3. Configura HTTPS con nginx/traefik
4. Habilita backups automáticos de PostgreSQL

## Licencia

Uso interno - Sistema ITAM

## Soporte

Para reportar problemas o solicitar funcionalidades, contacta al equipo de desarrollo.
