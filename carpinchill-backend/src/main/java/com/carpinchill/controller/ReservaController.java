package com.carpinchill.controller;

import com.carpinchill.dto.request.ReservaRequest;
import com.carpinchill.dto.response.ReservaResponse;
import com.carpinchill.model.Reserva;
import com.carpinchill.service.ReservaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
@CrossOrigin(origins = "*")
@Tag(name = "Reservas", description = "Sistema de reservas de viajes")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @Operation(summary = "Lista todas las reservas (solo admin/agente)")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENTE')")
    public ResponseEntity<List<ReservaResponse>> listarTodas() {
        return ResponseEntity.ok(
            reservaService.obtenerTodas().stream().map(ReservaResponse::from).toList()
        );
    }

    @Operation(summary = "Mis reservas (usuario autenticado)")
    @GetMapping("/mis-reservas")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ReservaResponse>> misReservas(Authentication auth) {
        return ResponseEntity.ok(
            reservaService.obtenerPorUsuario(auth.getName()).stream()
                .map(ReservaResponse::from).toList()
        );
    }

    @Operation(summary = "Detalle de una reserva")
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReservaResponse> obtener(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(ReservaResponse.from(reservaService.obtenerPorId(id)));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Crear una nueva reserva (usuario autenticado)")
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> crear(@Valid @RequestBody ReservaRequest dto, Authentication auth) {
        try {
            Reserva nueva = reservaService.crear(dto, auth.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(ReservaResponse.from(nueva));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Confirmar una reserva (solo admin/agente)")
    @PatchMapping("/{id}/confirmar")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENTE')")
    public ResponseEntity<?> confirmar(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(ReservaResponse.from(reservaService.confirmar(id)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Cancelar una reserva (admin/agente o el propio cliente)")
    @PatchMapping("/{id}/cancelar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> cancelar(@PathVariable Long id, Authentication auth) {
        try {
            Reserva reserva = reservaService.obtenerPorId(id);
            // Un cliente solo puede cancelar sus propias reservas
            boolean esAdminOAgente = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_AGENTE"));
            if (!esAdminOAgente && !reserva.getUsuario().getEmail().equals(auth.getName())) {
                return ResponseEntity.status(403).body("No tienes permiso para cancelar esta reserva.");
            }
            return ResponseEntity.ok(ReservaResponse.from(reservaService.cancelar(id)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Eliminar una reserva (solo admin)")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        try {
            reservaService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}