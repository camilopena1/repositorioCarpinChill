package com.carpinchill.repository;

import com.carpinchill.model.Viaje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio para Viaje.
 * Spring Data JPA genera automáticamente:
 *   findAll(), findById(), save(), deleteById()... sin escribir SQL.
 */
@Repository
public interface ViajeRepository extends JpaRepository<Viaje, Long> {

    // Buscar solo viajes activos (para el catálogo público)
    List<Viaje> findByActivoTrue();

    // Buscar viajes por país (útil para filtros)
    List<Viaje> findByPaisContainingIgnoreCase(String pais);

    // Buscar viajes por destino
    List<Viaje> findByDestinoContainingIgnoreCase(String destino);

    // Buscar viajes con precio máximo
    List<Viaje> findByPrecioLessThanEqual(Double precioMax);
}
