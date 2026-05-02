package com.carpinchill.service;

import com.carpinchill.model.Comentario;
import com.carpinchill.model.Usuario;
import com.carpinchill.model.Viaje;
import com.carpinchill.repository.ComentarioRepository;
import com.carpinchill.repository.ViajeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ComentarioService {

    private final ComentarioRepository comentarioRepository;
    private final ViajeRepository viajeRepository;
    private final UsuarioService usuarioService;

    public ComentarioService(ComentarioRepository comentarioRepository,
                              ViajeRepository viajeRepository,
                              UsuarioService usuarioService) {
        this.comentarioRepository = comentarioRepository;
        this.viajeRepository = viajeRepository;
        this.usuarioService = usuarioService;
    }

    public List<Comentario> obtenerPorViaje(Long viajeId) {
        return comentarioRepository.findByViajeId(viajeId);
    }

    public Double obtenerMediaViaje(Long viajeId) {
        return comentarioRepository.calcularMediaPorViaje(viajeId);
    }

    public Comentario crear(Long viajeId, Integer valoracion, String texto, String emailUsuario) {
        Usuario usuario = usuarioService.findByEmail(emailUsuario);
        Viaje viaje = viajeRepository.findById(viajeId)
                .orElseThrow(() -> new RuntimeException("Viaje no encontrado"));

        Comentario c = new Comentario();
        c.setUsuario(usuario);
        c.setViaje(viaje);
        c.setValoracion(valoracion);
        c.setComentario(texto);
        c.setFechaComentario(LocalDateTime.now());

        return comentarioRepository.save(c);
    }

    public void eliminar(Long id) {
        comentarioRepository.deleteById(id);
    }
}
