package com.carpinchill.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Configuración de seguridad de la aplicación.
 *
 * Usuarios en memoria (para esta entrega, sin BD):
 *   admin   / admin123  → rol ADMIN
 *   agente  / agente123 → rol AGENTE
 *   cliente / cliente123 → rol CLIENTE
 *
 * Rutas públicas (sin login):
 *   GET  /api/viajes         → catálogo público
 *   GET  /api/viajes/{id}    → detalle público
 *   POST /api/auth/login     → login
 *   GET  /api/auth/ping      → health check
 *   /h2-console/**           → consola H2 para depurar
 *
 * Rutas protegidas:
 *   POST/PUT/DELETE /api/viajes → necesita autenticación
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Usuarios en memoria para esta entrega.
     * En la siguiente entrega se reemplazará por usuarios en BD.
     */
    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder encoder) {
        var admin = User.builder()
                .username("admin")
                .password(encoder.encode("admin123"))
                .roles("ADMIN")
                .build();

        var agente = User.builder()
                .username("agente")
                .password(encoder.encode("agente123"))
                .roles("AGENTE")
                .build();

        var cliente = User.builder()
                .username("cliente")
                .password(encoder.encode("cliente123"))
                .roles("CLIENTE")
                .build();

        return new InMemoryUserDetailsManager(admin, agente, cliente);
    }

    /**
     * Reglas de seguridad para cada endpoint.
     */
    @Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .headers(headers -> headers
                    .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/api/auth/login", "/api/auth/ping").permitAll()
                    .requestMatchers("/h2-console/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/viajes/**").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/viajes/**").authenticated()
                    .requestMatchers(HttpMethod.PUT, "/api/viajes/**").authenticated()
                    .requestMatchers(HttpMethod.DELETE, "/api/viajes/**").authenticated()
                    .requestMatchers(HttpMethod.PATCH, "/api/viajes/**").authenticated()
                    .anyRequest().authenticated()
            );
            // .httpBasic(basic -> {});  ← esta línea eliminada

        return http.build();
    }

    /**
     * Configuración CORS para permitir peticiones desde Angular.
     * En desarrollo Angular corre en localhost:4200.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*")); // En producción poner solo la URL de Angular
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    /**
     * AuthenticationManager necesario en AuthController para validar credenciales.
     */
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}
