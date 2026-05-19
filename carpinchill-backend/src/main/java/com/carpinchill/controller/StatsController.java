package com.carpinchill.controller;

import com.carpinchill.model.EstadoReserva;
import com.carpinchill.repository.PagoRepository;
import com.carpinchill.repository.ReservaRepository;
import com.carpinchill.repository.ViajeRepository;
import com.carpinchill.repository.UsuarioRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "*")
@Tag(name = "Estadísticas", description = "Métricas del sistema para el panel de administración")
public class StatsController {

    private final ViajeRepository viajeRepository;
    private final ReservaRepository reservaRepository;
    private final UsuarioRepository usuarioRepository;
    private final PagoRepository pagoRepository;

    public StatsController(ViajeRepository viajeRepository,
                           ReservaRepository reservaRepository,
                           UsuarioRepository usuarioRepository,
                           PagoRepository pagoRepository) {
        this.viajeRepository = viajeRepository;
        this.reservaRepository = reservaRepository;
        this.usuarioRepository = usuarioRepository;
        this.pagoRepository = pagoRepository;
    }

    @Operation(summary = "Estadísticas generales del sistema")
    @GetMapping
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();

        // Viajes
        long totalViajes = viajeRepository.count();
        long viajesActivos = viajeRepository.findAll().stream().filter(v -> v.getActivo()).count();
        stats.put("totalViajes", totalViajes);
        stats.put("viajesActivos", viajesActivos);

        // Reservas
        long totalReservas = reservaRepository.count();
        long reservasPendientes = reservaRepository.findByEstado(EstadoReserva.PENDIENTE).size();
        long reservasConfirmadas = reservaRepository.findByEstado(EstadoReserva.CONFIRMADA).size();
        long reservasCanceladas = reservaRepository.findByEstado(EstadoReserva.CANCELADA).size();
        stats.put("totalReservas", totalReservas);
        stats.put("reservasPendientes", reservasPendientes);
        stats.put("reservasConfirmadas", reservasConfirmadas);
        stats.put("reservasCanceladas", reservasCanceladas);

        // Ingresos por reservas confirmadas
        double ingresosTotales = reservaRepository.findByEstado(EstadoReserva.CONFIRMADA)
                .stream().mapToDouble(r -> r.getPrecioTotal()).sum();
        stats.put("ingresosTotales", ingresosTotales);

        // Usuarios
        stats.put("totalUsuarios", usuarioRepository.count());

        // Pagos simulados
        Double ingresosPagos = pagoRepository.sumIngresosCompletados();
        stats.put("pagosCompletados", pagoRepository.countPagosCompletados());
        stats.put("pagosRechazados", pagoRepository.countPagosRechazados());
        stats.put("ingresosPagosConfirmados", ingresosPagos != null ? ingresosPagos : 0.0);

        return ResponseEntity.ok(stats);
    }
}
