# CarpinChill — Backend

API REST del sistema de gestión integral para agencias de viajes CarpinChill.
Desarrollada con Java 17 + Spring Boot 3.2.4 + PostgreSQL.

---

## Stack tecnológico

- Java 17 + Spring Boot 3.2.4
- Spring Security + JWT (autenticación stateless)
- JPA / Hibernate + PostgreSQL (producción) / H2 (desarrollo local)
- Lombok, Bucket4j, Spring Mail, Swagger (springdoc-openapi)

---

## Requisitos para ejecutar en local

- Java 17 o superior → https://adoptium.net
- Maven 3.8+ (o usar el wrapper `mvnw` incluido)

```bash
java -version   # debe mostrar 17 o superior
```

---

## Cómo ejecutar en local

```bash
cd carpinchill-backend

# Linux / Mac
./mvnw spring-boot:run

# Windows
mvnw.cmd spring-boot:run
```

La app arranca en **http://localhost:8080** con base de datos H2 en memoria.
Los datos de prueba se cargan automáticamente desde `data.sql`.

---

## Documentación de la API (Swagger)

Con el backend corriendo, abre:
**http://localhost:8080/swagger-ui.html**

En producción:
**https://carpinchill-backend.onrender.com/swagger-ui.html**

---

## Credenciales de prueba

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@carpinchill.com | admin123 | ADMIN |
| agente@carpinchill.com | agente123 | AGENTE |
| Registro público en /registro | mínimo 6 chars | CLIENTE |

---

## Variables de entorno (producción en Render)

| Variable | Descripción |
|----------|-------------|
| DATABASE_URL | URL JDBC de PostgreSQL |
| DATABASE_USERNAME | Usuario de la BD |
| DATABASE_PASSWORD | Contraseña de la BD |
| JWT_SECRET | Clave secreta para firmar tokens |
| JWT_EXPIRATION | Expiración en ms (86400000 = 24h) |
| OPENWEATHER_API_KEY | Clave de OpenWeatherMap |
| GEMINI_API_KEY | Clave de Google Gemini (moderación de comentarios) |
| MAIL_USERNAME | Email de Gmail para envíos |
| MAIL_PASSWORD | App password de Gmail |

---

## Estructura del proyecto

```
carpinchill-backend/src/main/java/com/carpinchill/
├── model/          → Entidades JPA: Usuario, Viaje, Reserva, Cliente, Comentario, Pago
├── repository/     → Interfaces JpaRepository
├── service/        → Lógica de negocio
├── controller/     → Endpoints REST
├── security/       → JWT, filtros, configuración de seguridad
├── dto/            → DTOs de request y response
└── config/         → Swagger, PasswordConfig
```

---

## Despliegue en Render

El backend se despliega automáticamente en Render al hacer push a main.
Usa el Dockerfile incluido en el repositorio (multi-stage build con Maven + JRE 17).

URL de producción: **https://carpinchill-backend.onrender.com**
