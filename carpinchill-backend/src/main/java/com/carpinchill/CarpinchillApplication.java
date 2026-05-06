package com.carpinchill;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Aplicación principal de CarpinChill.
 * @EnableAsync permite el envío de emails de forma asíncrona
 * sin bloquear las respuestas HTTP.
 */
@SpringBootApplication
@EnableAsync
public class CarpinchillApplication {
    public static void main(String[] args) {
        // Validación de seguridad: JWT_SECRET debe estar definida en producción
        String secret = System.getenv("JWT_SECRET");
        String profile = System.getenv("SPRING_PROFILES_ACTIVE");
        if (secret == null && "prod".equals(profile)) {
            throw new IllegalStateException(
                "ERROR: La variable de entorno JWT_SECRET no está definida. " +
                "El servidor no puede arrancar en producción sin una clave JWT segura."
            );
        }
        SpringApplication.run(CarpinchillApplication.class, args);
    }
}