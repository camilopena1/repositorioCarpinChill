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
        SpringApplication.run(CarpinchillApplication.class, args);
    }
}
