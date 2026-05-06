package com.carpinchill.repository;

import com.carpinchill.model.EstadoReserva;
import com.carpinchill.model.Reserva;
import com.carpinchill.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    List<Reserva> findByUsuario(Usuario usuario);
    List<Reserva> findByViajeId(Long viajeId);
    List<Reserva> findByEstado(EstadoReserva estado);

    @Query("SELECT SUM(r.numPersonas) FROM Reserva r WHERE r.viaje.id = :viajeId AND r.estado != com.carpinchill.model.EstadoReserva.CANCELADA")
    Integer contarPersonasPorViaje(Long viajeId);
}