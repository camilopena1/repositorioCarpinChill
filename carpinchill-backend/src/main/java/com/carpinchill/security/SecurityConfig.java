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
 *   - Añadidas rutas de Swagger como públicas:
 *       /swagger-ui/**
 *       /v3/api-docs/**
 *   - Añadidas rutas de Reservas con control de acceso.
 *
 * Usuarios en memoria:
 *   admin   / admin123  → ADMIN
 *   agente  / agente123 → AGENTE
 *   cliente / cliente123 → CLIENTE
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

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

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // Necesario para que la consola H2 funcione
            .headers(headers -> headers
                    .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))
            .authorizeHttpRequests(auth -> auth

                    // Rutas públicas
                    .requestMatchers("/api/auth/login", "/api/auth/ping").permitAll()
                    .requestMatchers("/h2-console/**").permitAll()

                    .requestMatchers(
                        "/swagger-ui/**",
                        "/swagger-ui.html",
                        "/v3/api-docs/**",
                        "/v3/api-docs.yaml"
                    ).permitAll()

                    // Viajes: GET público, resto autenticado
                    .requestMatchers(HttpMethod.GET, "/api/viajes/**").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/viajes/**").authenticated()
                    .requestMatchers(HttpMethod.PUT, "/api/viajes/**").authenticated()
                    .requestMatchers(HttpMethod.DELETE, "/api/viajes/**").authenticated()
                    .requestMatchers(HttpMethod.PATCH, "/api/viajes/**").authenticated()

                    // Reservas: POST público (cualquiera puede reservar)
                    // el resto requiere autenticación
                    .requestMatchers(HttpMethod.POST, "/api/reservas").authenticated()
                    .requestMatchers("/api/reservas/**").authenticated()

                    // El resto requiere autenticación
                    .anyRequest().authenticated()
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}
