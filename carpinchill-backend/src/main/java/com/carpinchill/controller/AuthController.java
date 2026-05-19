package com.carpinchill.controller;

import com.carpinchill.dto.request.LoginRequest;
import com.carpinchill.dto.request.RegistroRequest;
import com.carpinchill.dto.response.AuthResponse;
import com.carpinchill.model.Usuario;
import com.carpinchill.security.JwtUtil;
import com.carpinchill.security.SecurityConfig;
import com.carpinchill.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@Tag(name = "Autenticación", description = "Registro, login y gestión de sesión")
public class AuthController {

    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;
    private final UsuarioService usuarioService;
    private final SecurityConfig securityConfig;

    public AuthController(AuthenticationManager authManager, JwtUtil jwtUtil,
                          UsuarioService usuarioService, SecurityConfig securityConfig) {
        this.authManager = authManager;
        this.jwtUtil = jwtUtil;
        this.usuarioService = usuarioService;
        this.securityConfig = securityConfig;
    }

    @Operation(summary = "Registrar nuevo usuario")
    @PostMapping("/registro")
    public ResponseEntity<?> registro(@Valid @RequestBody RegistroRequest request,
                                       HttpServletRequest httpRequest) {
        if (!securityConfig.getBucketParaIp(httpRequest.getRemoteAddr()).tryConsume(1)) {
            return ResponseEntity.status(429).body(Map.of("error", "Demasiadas peticiones"));
        }
        try {
            Usuario usuario = usuarioService.registrar(request);
            Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            String token = jwtUtil.generateToken(auth);
            return ResponseEntity.status(HttpStatus.CREATED).body(AuthResponse.from(token, usuario));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Login con email y contraseña")
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request,
                                    HttpServletRequest httpRequest) {
        if (!securityConfig.getBucketParaIp(httpRequest.getRemoteAddr()).tryConsume(1)) {
            return ResponseEntity.status(429).body(Map.of("error", "Demasiadas peticiones"));
        }
        try {
            Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            String token = jwtUtil.generateToken(auth);
            Usuario usuario = usuarioService.findByEmail(request.getEmail());
            return ResponseEntity.ok(AuthResponse.from(token, usuario));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(Map.of("error", "Email o contraseña incorrectos"));
        }
    }

    @Operation(summary = "Crear nuevo agente (solo ADMIN)")
    @PostMapping("/crear-agente")
    public ResponseEntity<?> crearAgente(@RequestBody Map<String, String> body) {
        try {
            Usuario agente = usuarioService.crearAgente(
                body.get("nombre"),
                body.get("apellidos"),
                body.get("email"),
                body.get("password")
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", agente.getId(),
                "nombre", agente.getNombre(),
                "email", agente.getEmail(),
                "rol", agente.getRol()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Health check")
    @GetMapping("/ping")
    public ResponseEntity<?> ping() {
        return ResponseEntity.ok(Map.of("estado", "OK", "mensaje", "CarpinChill backend funcionando"));
    }

    @Operation(summary = "Info del usuario autenticado")
    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).build();
        Usuario usuario = usuarioService.findByEmail(auth.getName());
        return ResponseEntity.ok(Map.of(
            "id", usuario.getId(),
            "nombre", usuario.getNombre(),
            "email", usuario.getEmail(),
            "rol", usuario.getRol()
        ));
    }
}
