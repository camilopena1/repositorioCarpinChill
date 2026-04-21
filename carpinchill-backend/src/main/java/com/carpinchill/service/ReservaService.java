package com.carpinchill.service;

import com.carpinchill.dto.ReservaDTO;
import com.carpinchill.model.Reserva;
import com.carpinchill.model.Viaje;
import com.carpinchill.repository.ReservaRepository;
import com.carpinchill.repository.ViajeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Servicio para la gestión de reservas.
 *
 * Lógica de negocio importante:
 *   - Al crear una reserva se descuentan las plazas disponibles del viaje.
 *   - Al cancelar una reserva se devuelven las plazas al viaje.
 *   - No se puede reservar si no hay plazas suficientes.
 *   - El precio total se calcula automáticamente (precio × personas).
 */
@Service
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final ViajeRepository viajeRepository;

    public ReservaService(ReservaRepository reservaRepository,
                          ViajeRepository viajeRepository) {
        this.reservaRepository = reservaRepository;
        this.viajeRepository = viajeRepository;
    }

    /**
     * Devuelve todas las reservas del sistema.
     * Solo para el panel de administración.
     */
    public List<Reserva> obtenerTodas() {
        return reservaRepository.findAll();
    }

    /**
     * Devuelve las reservas de un usuario concreto.
     */
    public List<Reserva> obtenerPorUsuario(Long usuarioId) {
        return reservaRepository.findByUsuarioId(usuarioId);
    }

    /**
     * Busca una reserva por ID. Lanza excepción si no existe.
     */
    public Reserva obtenerPorId(Long id) {
        return reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada con id: " + id));
    }

    /**
     * Crea una nueva reserva.
     *
     * Proceso:
     *   1. Verificar que el viaje existe y está activo.
     *   2. Verificar que hay plazas suficientes.
     *   3. Calcular el precio total.
     *   4. Guardar la reserva.
     *   5. Descontar las plazas del viaje.
     *
     * @Transactional garantiza que si algo falla en el paso 5,
     * la reserva guardada en el paso 4 también se deshace.
     */
    @Transactional
    public Reserva crear(ReservaDTO dto) {
        // 1. Buscar el viaje
        Viaje viaje = viajeRepository.findById(dto.getViajeId())
                .orElseThrow(() -> new RuntimeException("Viaje no encontrado con id: " + dto.getViajeId()));

        // 2. Verificar que el viaje está activo
        if (!viaje.getActivo()) {
            throw new RuntimeException("El viaje no está disponible");
        }

        // 3. Verificar plazas disponibles
        if (viaje.getPlazasDisponibles() < dto.getNumPersonas()) {
            throw new RuntimeException(
                "No hay plazas suficientes. Disponibles: " + viaje.getPlazasDisponibles()
            );
        }

        // 4. Construir la reserva
        Reserva reserva = new Reserva();
        reserva.setUsuarioId(dto.getUsuarioId());
        reserva.setViaje(viaje);
        reserva.setFechaReserva(LocalDate.now());
        reserva.setNumPersonas(dto.getNumPersonas());
        reserva.setPrecioTotal(viaje.getPrecio() * dto.getNumPersonas()); // precio calculado
        reserva.setEstado("PENDIENTE");
        reserva.setNotas(dto.getNotas());

        // 5. Guardar la reserva
        Reserva guardada = reservaRepository.save(reserva);

        // 6. Descontar plazas del viaje
        viaje.setPlazasDisponibles(viaje.getPlazasDisponibles() - dto.getNumPersonas());
        viajeRepository.save(viaje);

        return guardada;
    }

    /**
     * Cancela una reserva y devuelve las plazas al viaje.
     */
    @Transactional
    public Reserva cancelar(Long id) {
        Reserva reserva = obtenerPorId(id);

        // No se puede cancelar lo que ya está cancelado
        if ("CANCELADA".equals(reserva.getEstado())) {
            throw new RuntimeException("La reserva ya está cancelada");
        }

        // Devolver plazas al viaje solo si no estaba ya cancelada
        Viaje viaje = reserva.getViaje();
        viaje.setPlazasDisponibles(viaje.getPlazasDisponibles() + reserva.getNumPersonas());
        viajeRepository.save(viaje);

        // Marcar como cancelada
        reserva.setEstado("CANCELADA");
        return reservaRepository.save(reserva);
    }

    /**
     * Confirma una reserva pendiente.
     */
    public Reserva confirmar(Long id) {
        Reserva reserva = obtenerPorId(id);
        if (!"PENDIENTE".equals(reserva.getEstado())) {
            throw new RuntimeException("Solo se pueden confirmar reservas en estado PENDIENTE");
        }
        reserva.setEstado("CONFIRMADA");
        return reservaRepository.save(reserva);
    }

    /**
     * Elimina una reserva definitivamente (baja física).
     * Solo para administradores.
     */
    @Transactional
    public void eliminar(Long id) {
        Reserva reserva = obtenerPorId(id);

        // Si no estaba cancelada, devolver plazas antes de eliminar
        if (!"CANCELADA".equals(reserva.getEstado())) {
            Viaje viaje = reserva.getViaje();
            viaje.setPlazasDisponibles(viaje.getPlazasDisponibles() + reserva.getNumPersonas());
            viajeRepository.save(viaje);
        }

        reservaRepository.deleteById(id);
    }
}
