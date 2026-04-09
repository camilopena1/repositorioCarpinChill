package com.carpinchill.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controlador de autenticación.
 *
 * Endpoint:
 *   POST /api/auth/login   → { "username": "admin", "password": "admin123" }
 *   POST /api/auth/logout  → cierra sesión
 *   GET  /api/auth/me      → devuelve info del usuario logueado
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthenticationManager authenticationManager;

    public AuthController(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    // ---- POST /api/auth/login ----
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credenciales) {
        String username = credenciales.get("username");
        String password = credenciales.get("password");

        try {
            // Spring Security valida las credenciales contra los usuarios en memoria
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );

            // Respuesta con datos del usuario autenticado
            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("mensaje", "Login correcto");
            respuesta.put("username", auth.getName());
            respuesta.put("rol", auth.getAuthorities().iterator().next().getAuthority());
            respuesta.put("autenticado", true);

            return ResponseEntity.ok(respuesta);

        } catch (BadCredentialsException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("mensaje", "Usuario o contraseña incorrectos");
            error.put("autenticado", false);
            return ResponseEntity.status(401).body(error);
        }
    }

    // ---- GET /api/auth/me ----
    // Devuelve info del usuario actualmente autenticado
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        Map<String, Object> info = new HashMap<>();
        info.put("username", authentication.getName());
        info.put("rol", authentication.getAuthorities().iterator().next().getAuthority());
        info.put("autenticado", true);

        return ResponseEntity.ok(info);
    }

    // ---- GET /api/auth/ping ----
    // Endpoint de prueba para saber si el backend está vivo
    @GetMapping("/ping")
    public ResponseEntity<Map<String, String>> ping() {
        Map<String, String> r = new HashMap<>();
        r.put("estado", "OK");
        r.put("mensaje", "CarpinChill backend funcionando correctamente");
        return ResponseEntity.ok(r);
    }
}
