# CarpinChill — Backend

API REST para el sistema de gestión de agencia de viajes CarpinChill.
Desarrollada con Java 17 + Spring Boot 3 + H2 (base de datos en memoria).

---

## Requisitos

- Java 17 o superior → [Descargar](https://adoptium.net/)
- Maven 3.8+ (o usar el wrapper `./mvnw` incluido en el proyecto)

Comprueba que tienes Java: `java -version`

---

## Cómo ejecutar en local

```bash
# 1. Clona el repositorio
git clone https://github.com/TU_USUARIO/carpinchill.git
cd carpinchill/carpinchill-backend

# 2. Ejecuta la aplicación
./mvnw spring-boot:run

# En Windows:
mvnw.cmd spring-boot:run
```

La app arranca en **http://localhost:8080**

---

## Endpoints disponibles

### 🔓 Públicos (sin autenticación)

| Método | URL | Descripción |
|--------|-----|-------------|
| GET | `/api/auth/ping` | Health check — comprueba que el backend está vivo |
| POST | `/api/auth/login` | Login con usuario y contraseña |
| GET | `/api/viajes` | Lista todos los viajes activos |
| GET | `/api/viajes/{id}` | Detalle de un viaje |
| GET | `/api/viajes?pais=Francia` | Filtra por país |
| GET | `/api/viajes?precioMax=1000` | Filtra por precio máximo |

### 🔒 Protegidos (requieren autenticación)

| Método | URL | Descripción |
|--------|-----|-------------|
| POST | `/api/viajes` | Crea un nuevo viaje |
| PUT | `/api/viajes/{id}` | Actualiza un viaje |
| DELETE | `/api/viajes/{id}` | Elimina un viaje |
| PATCH | `/api/viajes/{id}/desactivar` | Baja lógica |
| GET | `/api/viajes/todos` | Lista todos (activos + inactivos) |
| GET | `/api/auth/me` | Info del usuario autenticado |

---

## Usuarios de prueba

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | admin123 | ADMIN |
| agente | agente123 | AGENTE |
| cliente | cliente123 | CLIENTE |

---

## Ejemplos con curl / Postman

### Ping (health check)
```bash
curl http://localhost:8080/api/auth/ping
```

### Listar viajes
```bash
curl http://localhost:8080/api/viajes
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### Crear un viaje (autenticado con HTTP Basic)
```bash
curl -X POST http://localhost:8080/api/viajes \
  -H "Content-Type: application/json" \
  -u admin:admin123 \
  -d '{
    "titulo": "Ruta por Andalucía",
    "descripcion": "Granada, Sevilla y Córdoba en 7 días.",
    "destino": "Sevilla",
    "pais": "España",
    "latitud": 37.3891,
    "longitud": -5.9845,
    "precio": 750.00,
    "fechaInicio": "2025-07-15",
    "fechaFin": "2025-07-22",
    "plazasTotales": 20,
    "plazasDisponibles": 20
  }'
```

### Actualizar un viaje
```bash
curl -X PUT http://localhost:8080/api/viajes/1 \
  -H "Content-Type: application/json" \
  -u admin:admin123 \
  -d '{ "titulo": "París Romántico ACTUALIZADO", "precio": 950.00, ... }'
```

### Eliminar un viaje
```bash
curl -X DELETE http://localhost:8080/api/viajes/1 -u admin:admin123
```

---

## Consola H2 (ver la base de datos)

Mientras el backend esté corriendo, abre en el navegador:
**http://localhost:8080/h2-console**

- JDBC URL: `jdbc:h2:mem:carpinchill`
- User: `sa`
- Password: (vacío)

Desde aquí puedes ver las tablas y ejecutar SQL directamente.

---

## Despliegue en Render

1. Sube el código a GitHub
2. Entra en [render.com](https://render.com) y crea cuenta gratuita
3. "New" → "Web Service" → conecta tu repo de GitHub
4. Configura:
   - **Build Command:** `./mvnw clean package -DskipTests`
   - **Start Command:** `java -jar target/carpinchill-backend-0.0.1-SNAPSHOT.jar`
   - **Environment:** Java
5. Render detecta el `pom.xml` automáticamente
6. La URL pública será algo como: `https://carpinchill-backend.onrender.com`

> ⚠️ En el plan gratuito de Render, el backend "duerme" si no recibe peticiones durante 15 minutos. La primera petición tarda ~30 segundos en despertar.

---

## Estructura del proyecto

```
carpinchill-backend/
├── src/main/java/com/carpinchill/
│   ├── CarpinchillApplication.java     ← Clase principal
│   ├── model/
│   │   └── Viaje.java                  ← Entidad JPA
│   ├── repository/
│   │   └── ViajeRepository.java        ← Acceso a BD
│   ├── service/
│   │   └── ViajeService.java           ← Lógica de negocio
│   ├── controller/
│   │   ├── ViajeController.java        ← Endpoints REST
│   │   └── AuthController.java         ← Login / Auth
│   ├── security/
│   │   └── SecurityConfig.java         ← Configuración seguridad
│   └── config/
│       └── GlobalExceptionHandler.java ← Manejo de errores
├── src/main/resources/
│   ├── application.properties          ← Configuración
│   └── data.sql                        ← Datos de prueba
└── pom.xml                             ← Dependencias Maven
```
