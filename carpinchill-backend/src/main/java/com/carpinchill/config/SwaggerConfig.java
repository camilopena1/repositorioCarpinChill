package com.carpinchill.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI carpinChillOpenAPI() {
        // Esquema de seguridad JWT — aparece el botón "Authorize" en Swagger UI
        SecurityScheme jwtScheme = new SecurityScheme()
            .type(SecurityScheme.Type.HTTP)
            .scheme("bearer")
            .bearerFormat("JWT")
            .name("Authorization")
            .description("Pega aquí el token JWT obtenido en /api/auth/login (sin el prefijo 'Bearer ')");

        return new OpenAPI()
            .info(new Info()
                .title("CarpinChill API")
                .description(
                    "API REST del sistema de gestión de agencia de viajes CarpinChill. " +
                    "Permite gestionar viajes, reservas, clientes y comentarios con autenticación JWT y control de acceso por roles. " +
                    "Incluye integración con OpenWeatherMap para información meteorológica y rate limiting con Bucket4j. " +
                    "Desarrollado con Spring Boot 3 + Spring Security + JWT + PostgreSQL.\n\n"
                )
                .version("2.0.0 — Entrega 4")
                .contact(new Contact()
                    .name("Equipo CarpinChill")
                    .email("carpinchill@ies-juandelacierva.es"))
                .license(new License()
                    .name("Proyecto académico IES Juan de la Cierva — DAM 2025/2026"))
            )
            .addSecurityItem(new SecurityRequirement().addList("Bearer JWT"))
            .components(new Components()
                .addSecuritySchemes("Bearer JWT", jwtScheme)
            );
    }
}