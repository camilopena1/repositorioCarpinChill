package com.carpinchill.repository;

import com.carpinchill.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio para Reserva.
 * Spring Data JPA genera el SQL automáticamente a partir del nombre
 * de los métodos.
 */
@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    // Todas las reservas de un usuario concreto
    List<Reserva> findByUsuarioId(Long usuarioId);

    // Todas las reservas de un viaje concreto
    List<Reserva> findByViajeId(Long viajeId);

    // Reservas filtradas por estado (PENDIENTE, CONFIRMADA, CANCELADA)
    List<Reserva> findByEstado(String estado);

    // Reservas de un usuario con un estado concreto
    List<Reserva> findByUsuarioIdAndEstado(Long usuarioId, String estado);

    // Cuenta cuántas reservas confirmadas tiene un viaje (útil para calcular plazas ocupadas)
    @Query("SELECT SUM(r.numPersonas) FROM Reserva r WHERE r.viaje.id = :viajeId AND r.estado != 'CANCELADA'")
    Integer contarPersonasPorViaje(Long viajeId);
}
