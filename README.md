# Mi Lista de Tareas PWA

Aplicación web progresiva (PWA) de lista de tareas con funcionalidades completas.

## Características Implementadas

1. **Pantallas de Splash y Home**
   - Pantalla Splash con animación de carga 
   - Pantalla Home con interfaz completa de gestión de tareas

2. **Vistas del Cliente y Servidor**
   - CSR (Client-Side Rendering) con React Router para navegación
   - Renderizado dinámico en el cliente
   - Service Worker proporciona funcionalidad de caché en servidor

3. **Datos Locales, Remotos y Fuera de Línea**
   - **Locales**: Almacenamiento con LocalForage (IndexedDB)
   - **Remotos**: Carga inicial desde API (JSONPlaceholder)
   - **Offline**: Service Worker con estrategia Network First + Cache Fallback

4. **Notificaciones**
   - API de Notificaciones del navegador
   - Notificaciones al agregar o eliminar tareas
   - Solicitud de permisos al usuario

5. **Elementos Físicos del Dispositivo**
   - API de Geolocalización para obtener coordenadas GPS
   - Botón para activar ubicación
   - Visualización de latitud y longitud

## Tecnologías

- React 19 + Vite
- React Router DOM v7 
- LocalForage 
- Service Workers 
- Express 
- APIs Web: Notifications, Geolocation

## Instalación

```bash
npm install
```

## Desarrollo

Correr 2 terminales 

**Terminal 1 - Backend:**
```bash
npm run backend
```
Esto inicia el servidor JSON en http://localhost:3001

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Esto inicia Vite con **HTTPS** en https://localhost:5173

Abrir [https://localhost:5173](https://localhost:5173) en el navegador

**Nota**: El navegador te mostrará una advertencia de certificado (normal en desarrollo local). Click en "Avanzado" → "Continuar de todas formas".

## Build para Producción

```bash
npm run build
npm run serve
```
## Funcionalidades

### Gestión de Tareas
- Agregar nuevas tareas
- Marcar como completadas
- Eliminar tareas
- Persistencia de datos offline

### Indicadores
- Estado de conexión (online/offline)
- Contador de tareas totales y completadas
- Ubicación GPS del dispositivo

### PWA Features
- Instalable en dispositivos
- Funciona offline
- Service Worker registrado
- Manifest configurado

## Estructura del Proyecto

```
mi-pwa/
├── public/
│   ├── manifest.json      # Configuración PWA
│   ├── sw.js             # Service Worker
│   ├── icon-192.png      
│   └── icon-512.png      
│   ├── pages/
│   │   ├── Splash.jsx    # Pantalla inicial
│   │   ├── Splash.css
│   │   ├── Home.jsx      # Pantalla principal
│   │   └── Home.css
│   ├── App.jsx           # Componente raíz
│   ├── entry-client.jsx  # Entry point cliente
│   ├── entry-server.jsx  # Entry point servidor
│   └── index.css         # Estilos globales
├── server.js             # Servidor Express
├── db.json               # Base de datos JSON Server
├── index.html
├── package.json
└── vite.config.js

```

## Backend con JSON Server

El proyecto incluye un backend REST API

- **Endpoint GET**: `http://localhost:3001/todos` - Obtener todas las tareas
- **Endpoint POST**: `http://localhost:3001/todos` - Crear nueva tarea
- **Endpoint PUT**: `http://localhost:3001/todos/:id` - Actualizar tarea
- **Endpoint DELETE**: `http://localhost:3001/todos/:id` - Eliminar tarea

Las tareas se guardan en `db.json` y se sincronizan automáticamente entre:
- **Backend** (db.json)
- **Almacenamiento local** (IndexedDB)
- **Caché del Service Worker**

## Caso de Estudio: Lista de Tareas

La aplicación permite gestionar tareas diarias con las siguientes ventajas:

- **Acceso offline**: Trabaja sin conexión a internet
- **Sincronización**: Carga tareas desde el backend local cuando hay conexión
- **Persistencia**: Datos en backend (db.json) y almacenamiento local
- **Notificaciones**: Mantiene informado de cambios
- **Ubicación**: Registra dónde creas las tareas (opcional)
- **Multiplataforma**: Funciona en móviles, tablets y desktop

## Pruebas de Funcionalidad

### Probar Offline
1. Abrir DevTools > Application > Service Workers
2. Marca "Offline"
3. Recargar la página  y sigue funcionando

### Probar Notificaciones
1. Acepta permisos de notificaciones
2. Agrega una tarea
3. Deberías ver una notificación del sistema

### Probar Geolocalización
1. Click en botón "Ubicación"
2. Acepta permisos de ubicación
3. Se mostrarán las coordenadas GPS

### Probar Service Worker (Caché del Servidor)
1. Ejecuta la app y ábrela en el navegador
2. Abre DevTools > Application > Service Workers
3. Verifica que el SW esté registrado y activo
4. En Cache Storage verás los recursos cacheados

## Compatibilidad


- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## Licencia

MIT
