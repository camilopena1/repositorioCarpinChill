# CarpinChill — Frontend Angular
## Instrucciones para Vanessa

---

## Requisitos previos

Instalar Node.js (versión 18 o superior):
→ https://nodejs.org (descargar la versión LTS)

Comprobar que está instalado:
```bash
node -v    # debe mostrar v18.x o superior
npm -v     # debe mostrar 9.x o superior
```

Instalar Angular CLI globalmente (solo una vez):
```bash
npm install -g @angular/cli
```

---

## Poner en marcha el proyecto

```bash
# 1. Descomprime el ZIP y entra en la carpeta
cd carpinchill-frontend

# 2. Instala las dependencias (solo la primera vez, tarda 1-2 minutos)
npm install

# 3. Arranca la app en modo desarrollo
ng serve
```

La app estará disponible en: **http://localhost:4200**

> ⚠️ El backend de Brandon tiene que estar corriendo en localhost:8080
> para que la lista de viajes cargue datos reales.
> Si no está corriendo, saldrá el mensaje de error de conexión — es normal.

---

## Estructura del proyecto

```
carpinchill-frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── navbar/              ← Barra de navegación superior
│   │   │   ├── lista-viajes/        ← Catálogo principal (conecta con GET /api/viajes)
│   │   │   ├── detalle-viaje/       ← Detalle de un viaje por ID
│   │   │   └── login/               ← Pantalla de login
│   │   ├── services/
│   │   │   ├── viajes.service.ts    ← Todas las llamadas HTTP a /api/viajes
│   │   │   └── auth.service.ts      ← Login, logout, gestión de sesión
│   │   ├── guards/
│   │   │   └── auth.guard.ts        ← Protege rutas que necesitan login
│   │   ├── models/
│   │   │   └── viaje.model.ts       ← Interfaces TypeScript (Viaje, Usuario, etc.)
│   │   ├── app.routes.ts            ← Definición de rutas
│   │   ├── app.component.ts         ← Componente raíz
│   │   └── app.config.ts            ← Configuración global (HttpClient, Router)
│   ├── environments/
│   │   ├── environment.ts           ← URL del backend en desarrollo (localhost:8080)
│   │   └── environment.production.ts ← URL del backend en producción (Render)
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── angular.json
├── package.json
└── tsconfig.json
```

---

## Rutas de la aplicación

| URL | Componente | Descripción |
|-----|-----------|-------------|
| `/` | → redirige a `/viajes` | |
| `/viajes` | ListaViajesComponent | Catálogo con filtros |
| `/viajes/:id` | DetalleViajeComponent | Detalle de un viaje |
| `/login` | LoginComponent | Formulario de login |

---

## Cómo probar el login

En la pantalla de login hay chips de acceso rápido.
También se puede escribir manualmente:

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | admin123 | ADMIN |
| agente | agente123 | AGENTE |
| cliente | cliente123 | CLIENTE |

---

## Cuando Brandon cambie la URL de Render

Abrir el fichero:
`src/environments/environment.production.ts`

Y cambiar:
```typescript
apiUrl: 'https://carpinchill-backend.onrender.com/api'
```
por la URL real que dé Render.

Para desarrollo en local no hay que tocar nada,
ya apunta a localhost:8080 automáticamente.

---

## Construir para producción (cuando haya que desplegar)

```bash
ng build
```

Genera la carpeta `dist/carpinchill-frontend/browser/`
con los ficheros estáticos listos para subir a Netlify, Vercel o Render.

---

## Si sale error "Cannot find module" al hacer npm install

```bash
# Borrar node_modules y volver a instalar
rm -rf node_modules
npm install
```

## Si sale error de CORS al llamar al backend

Es porque el backend no está corriendo o está en otro puerto.
Comprobar que Brandon tiene el backend en marcha en localhost:8080.
El backend ya tiene CORS configurado para aceptar peticiones de Angular.

---

## Sección para la memoria (copiar en el Word)

### 9. FRONTEND — Angular

Para el desarrollo del frontend se ha utilizado Angular 17 en su modalidad
standalone, prescindiendo de NgModules en favor de componentes independientes
que se importan directamente entre sí. Esta arquitectura, recomendada a partir
de Angular 14, reduce la complejidad del proyecto y facilita el lazy loading
de rutas.

La aplicación se estructura en cuatro componentes principales:

- ListaViajesComponent: componente principal que consume el endpoint
  GET /api/viajes del backend mediante el servicio ViajesService e
  implementa HttpClient de Angular. Muestra los viajes en una cuadrícula
  de tarjetas responsive con filtros por país y precio máximo aplicados
  en el cliente sin peticiones adicionales al servidor.

- DetalleViajeComponent: obtiene un viaje concreto mediante
  GET /api/viajes/{id} a partir del parámetro de ruta y muestra
  toda la información disponible del destino.

- LoginComponent: formulario de autenticación que envía las credenciales
  al endpoint POST /api/auth/login. Si el servidor confirma el acceso,
  los datos del usuario se persisten en localStorage para mantener la
  sesión entre recargas de página.

- NavbarComponent: barra de navegación global que muestra el nombre del
  usuario autenticado y el botón de cierre de sesión cuando hay sesión
  activa, adaptándose dinámicamente al estado de autenticación.

La comunicación con el backend se centraliza en dos servicios:
ViajesService para las operaciones CRUD sobre viajes y AuthService
para la gestión de sesión. Ambos utilizan el módulo HttpClient de
Angular para realizar peticiones HTTP asíncronas mediante Observables
de RxJS.

Las rutas están protegidas mediante un guard funcional (authGuard)
que redirige al login si el usuario intenta acceder a una ruta
protegida sin autenticación previa.

[INSERTAR AQUÍ CAPTURAS DE PANTALLA DE LA APP]
