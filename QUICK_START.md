# 🚀 ITAM System - Quick Start Guide

## Inicio Rápido en 5 Pasos

### Paso 1: Configurar el Servidor

```bash
cd ITAM-Server

# Crear archivo .env (copia del ejemplo)
copy .env.example .env

# Editar .env si es necesario (opcional para desarrollo)
```

### Paso 2: Iniciar Docker

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs (opcional)
docker-compose logs -f
```

Espera 30 segundos para que la base de datos se inicialice.

### Paso 3: Acceder a la Aplicación Web

Abre tu navegador en: **http://localhost:5173**

Deberías ver:
- ✅ Header con gradiente azul/morado
- ✅ Tarjetas de estadísticas (Total, Online, Offline, etc.)
- ✅ Tabla de inventario vacía

### Paso 4: Crear un Piso (Opcional pero Recomendado)

1. Haz clic en el icono de edificio (🏢) en el header
2. Completa el formulario:
   - **Nombre:** Piso 1
   - **Nivel:** 1
3. Arrastra una imagen del plano o haz clic para seleccionar
4. Haz clic en **"Crear Piso"**

### Paso 5: Configurar y Ejecutar el Agente

```bash
cd ..\ITAM-Agent

# Instalar dependencias
pip install -r requirements.txt

# Copiar configuración de ejemplo
copy config.json.example config.json

# Probar conexión
python src/main.py --test-connection

# Ejecutar una vez (prueba)
python src/main.py --once

# Ejecutar en modo continuo
python src/main.py
```

---

## ✅ Verificación

### Backend
- **URL:** http://localhost:8000
- **Docs:** http://localhost:8000/docs
- **Health:** http://localhost:8000 (debe mostrar `{"status": "online"}`)

### Frontend
- **URL:** http://localhost:5173
- **Debe mostrar:** Dashboard con diseño premium

### Base de Datos
```bash
docker exec -it itam_db psql -U postgres -d itam_db
\dt  # Ver tablas
\q   # Salir
```

---

## 🎯 Primeros Pasos

### 1. Ver el Inventario
- Ve a la pestaña **"Inventario"**
- Deberías ver los equipos que reportaron
- Usa la búsqueda para filtrar

### 2. Ubicar Equipos en el Mapa
- Ve a la pestaña **"Mapa Físico"**
- Selecciona el piso que creaste
- Arrastra los iconos de los equipos a sus ubicaciones
- Las posiciones se guardan automáticamente

### 3. Gestionar Pisos
- Haz clic en el icono de edificio (🏢)
- Crea, edita o elimina pisos
- Sube imágenes de planos

---

## 🔧 Comandos Útiles

### Docker
```bash
# Ver estado de contenedores
docker-compose ps

# Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Reiniciar servicios
docker-compose restart

# Detener todo
docker-compose down

# Limpiar todo (incluye volúmenes)
docker-compose down -v
```

### Agente
```bash
# Ayuda
python src/main.py --help

# Probar conexión
python src/main.py --test-connection

# Ejecutar una vez
python src/main.py --once

# Modo continuo
python src/main.py

# Generar config de ejemplo
python src/main.py --config
```

---

## 🐛 Solución de Problemas

### El frontend no carga
```bash
cd ITAM-Server/frontend
npm install
npm run dev
```

### El backend no responde
```bash
docker-compose logs backend
# Verificar errores en los logs
```

### El agente no se conecta
1. Verifica que el backend esté corriendo: http://localhost:8000
2. Verifica el `api_url` en `config.json`
3. Verifica el `api_token` (debe coincidir con el `.env` del servidor)

### Los equipos no aparecen en el mapa
1. Verifica que tengan `piso_id` asignado
2. Selecciona el piso correcto en el dropdown
3. Verifica que el piso tenga una imagen cargada

---

## 📚 Próximos Pasos

1. **Lee la documentación completa:**
   - [ITAM-Server/README.md](file:///C:/Users/SOFIA/Documents/GitHub/CLIENT-SERVER_IPS-INVENTORY/ITAM-Server/README.md)
   - [ITAM-Agent/README.md](file:///C:/Users/SOFIA/Documents/GitHub/CLIENT-SERVER_IPS-INVENTORY/ITAM-Agent/README.md)

2. **Revisa el walkthrough:**
   - [walkthrough.md](file:///C:/Users/SOFIA/.gemini/antigravity/brain/f2968fd1-6924-4b80-9f18-ecd981047f8a/walkthrough.md)

3. **Personaliza la configuración:**
   - Cambia los colores en `frontend/src/index.css`
   - Ajusta el intervalo de reporte del agente
   - Configura múltiples pisos y edificios

4. **Despliega en producción:**
   - Configura HTTPS
   - Usa contraseñas seguras
   - Configura backups de la base de datos

---

## 🎉 ¡Listo!

Tu sistema ITAM está funcionando. Ahora puedes:
- ✅ Monitorear equipos en tiempo real
- ✅ Ubicarlos en mapas interactivos
- ✅ Exportar inventarios a CSV
- ✅ Gestionar múltiples pisos

**¿Necesitas ayuda?** Revisa la documentación o los logs para más detalles.
