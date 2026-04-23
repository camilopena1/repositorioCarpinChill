package com.carpinchill.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración de Swagger / OpenAPI 3.
 *
 * Swagger genera automáticamente una interfaz web interactiva
 * donde se pueden ver y probar todos los endpoints de la API
 * sin necesidad de Postman u otra herramienta externa.
 *
 * URL de acceso: http://localhost:8080/swagger-ui/index.html
 */
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI carpinChillOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("CarpinChill API")
                .description(
                    "API REST del sistema de gestión de agencia de viajes CarpinChill. " +
                    "Permite gestionar viajes, reservas y autenticación de usuarios con control de acceso por roles. " +
                    "Desarrollado con Spring Boot 3 + Spring Security + H2."
                )
                .version("1.0.0 — Entrega 3")
                .contact(new Contact()
                    .name("Equipo CarpinChill")
                    .email("carpinchill@ies-juandelacierva.es"))
                .license(new License()
                    .name("Proyecto académico IES Juan de la Cierva — DAM 2025/2026"))
            );
    }
}
