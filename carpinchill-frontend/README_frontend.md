# CarpinChill — Frontend Angular

Interfaz web del sistema de gestión integral para agencias de viajes CarpinChill.
Desarrollada con Angular 17 standalone components + TypeScript.

---

## Stack tecnológico

- Angular 17 (standalone components, sin NgModules)
- TypeScript + RxJS
- Leaflet (mapas interactivos con OpenStreetMap)
- HttpClient para comunicación con la API REST

---

## Requisitos previos

- Node.js 18 o superior → https://nodejs.org (versión LTS)
- Angular CLI

```bash
node -v            # debe mostrar v18.x o superior
npm install -g @angular/cli
```

---

## Cómo ejecutar en local

```bash
cd carpinchill-frontend

# Instalar dependencias (solo la primera vez)
npm install

# Arrancar en modo desarrollo
ng serve
```

La app estará disponible en **http://localhost:4200**

> El backend debe estar corriendo en localhost:8080 para que los datos carguen correctamente.

---

## Credenciales de prueba

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@carpinchill.com | admin123 | ADMIN |
| agente@carpinchill.com | agente123 | AGENTE |
| Registro público en /registro | mínimo 6 chars | CLIENTE |

---

## Rutas de la aplicación

| URL | Componente | Acceso |
|-----|-----------|--------|
| `/` | → redirige a `/viajes` | Público |
| `/viajes` | ListaViajesComponent | Público |
| `/viajes/:id` | DetalleViajeComponent | Público |
| `/login` | LoginComponent | Público |
| `/registro` | RegistroComponent | Público |
| `/mis-reservas` | MisReservasComponent | Autenticado |
| `/perfil` | PerfilComponent | Autenticado |
| `/pago/:reservaId` | PagoComponent | Autenticado |
| `/admin` | AdminComponent | ADMIN / AGENTE |

---

## Estructura del proyecto

```
carpinchill-frontend/src/app/
├── components/
│   ├── navbar/           → Barra de navegación con modo oscuro
│   ├── splash/           → Pantalla de bienvenida animada
│   ├── lista-viajes/     → Catálogo con filtros avanzados
│   ├── detalle-viaje/    → Detalle con mapa, clima, reserva y comentarios
│   ├── login/            → Formulario de login JWT
│   ├── registro/         → Registro público de nuevos usuarios
│   ├── mis-reservas/     → Reservas del usuario autenticado
│   ├── perfil/           → Perfil editable con foto y país
│   ├── pago/             → Simulador de pago con tarjeta
│   └── admin/            → Panel de administración (4 pestañas)
├── services/
│   ├── auth.service.ts       → Login, logout, gestión de sesión JWT
│   ├── viajes.service.ts     → CRUD de viajes y filtros
│   ├── reserva.service.ts    → Gestión de reservas
│   ├── comentario.service.ts → Comentarios y valoraciones
│   ├── cliente.service.ts    → Perfil de cliente
│   ├── clima.service.ts      → Integración OpenWeatherMap
│   └── pago.service.ts       → Simulador de pagos
├── guards/
│   └── auth.guard.ts     → Protege rutas que requieren autenticación
├── models/
│   └── viaje.model.ts    → Interfaces TypeScript
├── app.routes.ts         → Definición de rutas con lazy loading
├── app.component.ts      → Componente raíz
└── app.config.ts         → Configuración global
```

---

## Construir para producción

```bash
ng build
```

Genera `dist/carpinchill-frontend/browser/` con los ficheros estáticos.

URL de producción: **https://carpinchill-frontend.onrender.com**
