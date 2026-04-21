package com.carpinchill.controller;

import com.carpinchill.dto.ReservaDTO;
import com.carpinchill.model.Reserva;
import com.carpinchill.service.ReservaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para el sistema de reservas.
 *
 * Endpoints:
 *   GET    /api/reservas              → lista todas las reservas (admin)
 *   GET    /api/reservas/usuario/{id} → reservas de un usuario concreto
 *   GET    /api/reservas/{id}         → detalle de una reserva
 *   POST   /api/reservas              → crea una nueva reserva
 *   PATCH  /api/reservas/{id}/confirmar → confirma una reserva pendiente
 *   PATCH  /api/reservas/{id}/cancelar  → cancela una reserva
 *   DELETE /api/reservas/{id}           → elimina una reserva (admin)
 */
@RestController
@RequestMapping("/api/reservas")
@CrossOrigin(origins = "*")
@Tag(name = "Reservas", description = "Gestión del sistema de reservas de viajes")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    // ---- GET /api/reservas ----
    @Operation(summary = "Lista todas las reservas",
               description = "Devuelve todas las reservas del sistema. Solo para administradores.")
    @ApiResponse(responseCode = "200", description = "Lista de reservas obtenida correctamente")
    @GetMapping
    public ResponseEntity<List<Reserva>> listarTodas() {
        return ResponseEntity.ok(reservaService.obtenerTodas());
    }

    // ---- GET /api/reservas/usuario/{usuarioId} ----
    @Operation(summary = "Lista reservas de un usuario",
               description = "Devuelve todas las reservas realizadas por un usuario concreto.")
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Reserva>> listarPorUsuario(
            @Parameter(description = "ID del usuario") @PathVariable Long usuarioId) {
        return ResponseEntity.ok(reservaService.obtenerPorUsuario(usuarioId));
    }

    // ---- GET /api/reservas/{id} ----
    @Operation(summary = "Detalle de una reserva", description = "Busca una reserva por su ID.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Reserva encontrada"),
        @ApiResponse(responseCode = "404", description = "Reserva no encontrada")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Reserva> obtenerPorId(
            @Parameter(description = "ID de la reserva") @PathVariable Long id) {
        try {
            return ResponseEntity.ok(reservaService.obtenerPorId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ---- POST /api/reservas ----
    @Operation(summary = "Crea una nueva reserva",
               description = "Crea una reserva para un viaje. Descuenta automáticamente las plazas disponibles del viaje. El precio total se calcula en el backend.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Reserva creada correctamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos o sin plazas disponibles")
    })
    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody ReservaDTO dto) {
        try {
            Reserva nueva = reservaService.crear(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(nueva);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ---- PATCH /api/reservas/{id}/confirmar ----
    @Operation(summary = "Confirma una reserva pendiente")
    @PatchMapping("/{id}/confirmar")
    public ResponseEntity<?> confirmar(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(reservaService.confirmar(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ---- PATCH /api/reservas/{id}/cancelar ----
    @Operation(summary = "Cancela una reserva",
               description = "Cancela la reserva y devuelve las plazas al viaje automáticamente.")
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<?> cancelar(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(reservaService.cancelar(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ---- DELETE /api/reservas/{id} ----
    @Operation(summary = "Elimina una reserva", description = "Baja física. Solo para administradores.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        try {
            reservaService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
