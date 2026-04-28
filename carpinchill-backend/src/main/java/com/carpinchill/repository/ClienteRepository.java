package com.carpinchill.repository;

import com.carpinchill.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    List<Cliente> findByActivoTrue();
    Optional<Cliente> findByDni(String dni);
    Optional<Cliente> findByUsuarioId(Long usuarioId);
    List<Cliente> findByUsuarioNombreContainingIgnoreCaseOrUsuarioApellidosContainingIgnoreCase(String nombre, String apellidos);
}
