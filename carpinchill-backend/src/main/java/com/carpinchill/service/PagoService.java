package com.carpinchill.service;

import com.carpinchill.model.EstadoReserva;
import com.carpinchill.model.Pago;
import com.carpinchill.model.Reserva;
import com.carpinchill.repository.PagoRepository;
import com.carpinchill.repository.ReservaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class PagoService {

    private final PagoRepository pagoRepository;
    private final ReservaRepository reservaRepository;
    private final EmailService emailService;
    private final Random random = new Random();

    // Tarjetas que siempre se rechazan (para simular fallos controlados en demos)
    private static final List<String> TARJETAS_RECHAZADAS = List.of("0000", "9999");

    // Mensajes de rechazo realistas
    private static final List<String> MENSAJES_RECHAZO = List.of(
        "Fondos insuficientes",
        "Tarjeta caducada",
        "Operación denegada por el banco emisor",
        "Límite de crédito excedido"
    );

    public PagoService(PagoRepository pagoRepository,
                       ReservaRepository reservaRepository,
                       EmailService emailService) {
        this.pagoRepository = pagoRepository;
        this.reservaRepository = reservaRepository;
        this.emailService = emailService;
    }

    /**
     * Simula el procesamiento de un pago con tarjeta.
     *
     * Lógica de simulación:
     * - Tarjetas terminadas en 0000 o 9999 → siempre rechazadas (útil para demos)
     * - Resto → 85% de probabilidad de éxito, 15% de rechazo aleatorio
     *
     * Si el pago es exitoso:
     * - Crea el registro en tabla pago con estado COMPLETADO
     * - Cambia el estado de la reserva a CONFIRMADA
     * - Envía email de confirmación al cliente
     *
     * @param reservaId      ID de la reserva a pagar
     * @param numeroTarjeta  Número completo (solo usamos los últimos 4 dígitos)
     * @param nombreTitular  Nombre en la tarjeta
     * @return Map con resultado: exito, mensaje, pago (objeto Pago guardado)
     */
    @Transactional
    public Map<String, Object> procesarPago(Long reservaId, String numeroTarjeta, String nombreTitular) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        if (reserva.getEstado() == EstadoReserva.CANCELADA) {
            throw new RuntimeException("No se puede pagar una reserva cancelada");
        }
        if (reserva.getEstado() == EstadoReserva.CONFIRMADA) {
            throw new RuntimeException("Esta reserva ya ha sido pagada y confirmada");
        }

        // Extraemos solo los últimos 4 dígitos (nunca guardamos el número completo)
        String ultimos4 = numeroTarjeta.replaceAll("\\s", "");
        ultimos4 = ultimos4.substring(Math.max(0, ultimos4.length() - 4));

        // Determinar si el pago es exitoso
        boolean exito = !TARJETAS_RECHAZADAS.contains(ultimos4) && random.nextInt(100) < 85;

        Pago pago = new Pago();
        pago.setReserva(reserva);
        pago.setImporte(reserva.getPrecioTotal());
        pago.setFechaPago(LocalDateTime.now());
        pago.setUltimosDigitos(ultimos4);
        pago.setNombreTitular(nombreTitular);

        if (exito) {
            pago.setEstado("COMPLETADO");
            pago.setMensaje("Pago procesado correctamente. Su reserva ha sido confirmada.");
            pagoRepository.save(pago);

            // Confirmar la reserva automáticamente
            reserva.setEstado(EstadoReserva.CONFIRMADA);
            reservaRepository.save(reserva);

            // Enviar email de confirmación de forma asíncrona
            emailService.enviarConfirmacionReserva(reserva);

            return Map.of("exito", true, "mensaje", pago.getMensaje(), "pago", pago);
        } else {
            String mensajeRechazo = MENSAJES_RECHAZADOS();
            pago.setEstado("RECHAZADO");
            pago.setMensaje(mensajeRechazo);
            pagoRepository.save(pago);

            return Map.of("exito", false, "mensaje", mensajeRechazo, "pago", pago);
        }
    }

    private String MENSAJES_RECHAZADOS() {
        return MENSAJES_RECHAZO.get(random.nextInt(MENSAJES_RECHAZO.size()));
    }

    public List<Pago> obtenerTodos() {
        return pagoRepository.findAll();
    }

    public List<Pago> obtenerPorReserva(Long reservaId) {
        return pagoRepository.findByReservaId(reservaId);
    }

    public Map<String, Object> obtenerEstadisticas() {
        Double ingresos = pagoRepository.sumIngresosCompletados();
        return Map.of(
            "pagosCompletados", pagoRepository.countPagosCompletados(),
            "pagosRechazados", pagoRepository.countPagosRechazados(),
            "ingresosConfirmados", ingresos != null ? ingresos : 0.0
        );
    }
}
