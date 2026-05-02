package com.carpinchill.service;

import com.carpinchill.dto.request.ReservaRequest;
import com.carpinchill.model.*;
import com.carpinchill.repository.ReservaRepository;
import com.carpinchill.repository.ViajeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final ViajeRepository viajeRepository;
    private final UsuarioService usuarioService;
    private final EmailService emailService;

    public ReservaService(ReservaRepository reservaRepository,
                          ViajeRepository viajeRepository,
                          UsuarioService usuarioService,
                          EmailService emailService) {
        this.reservaRepository = reservaRepository;
        this.viajeRepository = viajeRepository;
        this.usuarioService = usuarioService;
        this.emailService = emailService;
    }

    public List<Reserva> obtenerTodas() {
        return reservaRepository.findAll();
    }

    public List<Reserva> obtenerPorUsuario(String email) {
        Usuario usuario = usuarioService.findByEmail(email);
        return reservaRepository.findByUsuario(usuario);
    }

    public Reserva obtenerPorId(Long id) {
        return reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));
    }

    @Transactional
    public Reserva crear(ReservaRequest dto, String emailUsuario) {
        Usuario usuario = usuarioService.findByEmail(emailUsuario);
        Viaje viaje = viajeRepository.findById(dto.getViajeId())
                .orElseThrow(() -> new RuntimeException("Viaje no encontrado"));

        if (!viaje.getActivo()) throw new RuntimeException("El viaje no está disponible");
        if (viaje.getPlazasDisponibles() < dto.getNumPersonas())
            throw new RuntimeException("No hay plazas suficientes. Disponibles: " + viaje.getPlazasDisponibles());

        Reserva reserva = new Reserva();
        reserva.setUsuario(usuario);
        reserva.setViaje(viaje);
        reserva.setFechaReserva(LocalDateTime.now());
        reserva.setNumPersonas(dto.getNumPersonas());
        reserva.setPrecioTotal(viaje.getPrecio() * dto.getNumPersonas());
        reserva.setEstado(EstadoReserva.PENDIENTE);
        reserva.setNotas(dto.getNotas());

        Reserva guardada = reservaRepository.save(reserva);
        viaje.setPlazasDisponibles(viaje.getPlazasDisponibles() - dto.getNumPersonas());
        viajeRepository.save(viaje);

        return guardada;
    }

    @Transactional
    public Reserva confirmar(Long id) {
        Reserva reserva = obtenerPorId(id);
        if (reserva.getEstado() != EstadoReserva.PENDIENTE)
            throw new RuntimeException("Solo se pueden confirmar reservas PENDIENTES");
        reserva.setEstado(EstadoReserva.CONFIRMADA);
        Reserva guardada = reservaRepository.save(reserva);
        // Email de confirmación asíncrono
        emailService.enviarConfirmacionReserva(guardada);
        return guardada;
    }

    @Transactional
    public Reserva cancelar(Long id) {
        Reserva reserva = obtenerPorId(id);
        if (reserva.getEstado() == EstadoReserva.CANCELADA)
            throw new RuntimeException("La reserva ya está cancelada");
        Viaje viaje = reserva.getViaje();
        viaje.setPlazasDisponibles(viaje.getPlazasDisponibles() + reserva.getNumPersonas());
        viajeRepository.save(viaje);
        reserva.setEstado(EstadoReserva.CANCELADA);
        Reserva guardada = reservaRepository.save(reserva);
        // Email de cancelación asíncrono
        emailService.enviarCancelacionReserva(guardada);
        return guardada;
    }

    @Transactional
    public void eliminar(Long id) {
        Reserva reserva = obtenerPorId(id);
        if (reserva.getEstado() != EstadoReserva.CANCELADA) {
            Viaje viaje = reserva.getViaje();
            viaje.setPlazasDisponibles(viaje.getPlazasDisponibles() + reserva.getNumPersonas());
            viajeRepository.save(viaje);
        }
        reservaRepository.deleteById(id);
    }
}
