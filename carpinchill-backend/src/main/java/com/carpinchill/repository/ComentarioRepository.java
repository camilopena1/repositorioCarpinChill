package com.carpinchill.repository;

import com.carpinchill.model.Comentario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComentarioRepository extends JpaRepository<Comentario, Long> {
    List<Comentario> findByViajeId(Long viajeId);
    List<Comentario> findByUsuarioId(Long usuarioId);

    void deleteByViajeId(Long viajeId);

    @Query("SELECT AVG(c.valoracion) FROM Comentario c WHERE c.viaje.id = :viajeId")
    Double calcularMediaPorViaje(Long viajeId);
}