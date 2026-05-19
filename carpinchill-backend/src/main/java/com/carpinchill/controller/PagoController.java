package com.carpinchill.controller;

import com.carpinchill.service.PagoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pagos")
@CrossOrigin(origins = "*")
@Tag(name = "Pagos", description = "Simulador de pagos con tarjeta (en producción se integraría con Stripe/PayPal)")
public class PagoController {

    private final PagoService pagoService;

    public PagoController(PagoService pagoService) {
        this.pagoService = pagoService;
    }

    /**
     * Procesa un pago simulado para una reserva.
     * Body esperado: { reservaId, numeroTarjeta, nombreTitular, fechaExpiracion, cvv }
     * Nota: fechaExpiracion y cvv se validan en el frontend pero no se almacenan en el backend.
     */
    @Operation(summary = "Procesar pago simulado de una reserva")
    @PostMapping("/procesar")
    public ResponseEntity<?> procesarPago(@RequestBody Map<String, Object> body,
                                           Authentication auth) {
        try {
            Long reservaId = Long.valueOf(body.get("reservaId").toString());
            String numeroTarjeta = (String) body.get("numeroTarjeta");
            String nombreTitular = (String) body.get("nombreTitular");

            Map<String, Object> resultado = pagoService.procesarPago(reservaId, numeroTarjeta, nombreTitular);
            boolean exito = (boolean) resultado.get("exito");

            return exito
                ? ResponseEntity.ok(resultado)
                : ResponseEntity.status(402).body(resultado); // 402 Payment Required
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Listar todos los pagos (admin/agente)")
    @GetMapping
    public ResponseEntity<?> listarPagos() {
        return ResponseEntity.ok(pagoService.obtenerTodos());
    }

    @Operation(summary = "Pagos de una reserva concreta")
    @GetMapping("/reserva/{reservaId}")
    public ResponseEntity<?> pagosPorReserva(@PathVariable Long reservaId) {
        return ResponseEntity.ok(pagoService.obtenerPorReserva(reservaId));
    }

    @Operation(summary = "Estadísticas de pagos (admin)")
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> estadisticas() {
        return ResponseEntity.ok(pagoService.obtenerEstadisticas());
    }
}
