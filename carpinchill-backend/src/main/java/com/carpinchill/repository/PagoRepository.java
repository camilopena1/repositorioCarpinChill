package com.carpinchill.repository;

import com.carpinchill.model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {

    List<Pago> findByReservaId(Long reservaId);

    List<Pago> findByEstado(String estado);

    @Query("SELECT SUM(p.importe) FROM Pago p WHERE p.estado = 'COMPLETADO'")
    Double sumIngresosCompletados();

    @Query("SELECT COUNT(p) FROM Pago p WHERE p.estado = 'COMPLETADO'")
    Long countPagosCompletados();

    @Query("SELECT COUNT(p) FROM Pago p WHERE p.estado = 'RECHAZADO'")
    Long countPagosRechazados();
}
