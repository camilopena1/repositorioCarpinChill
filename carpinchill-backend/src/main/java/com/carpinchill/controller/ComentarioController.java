package com.carpinchill.controller;

import com.carpinchill.model.Comentario;
import com.carpinchill.repository.ClienteRepository;
import com.carpinchill.service.ComentarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comentarios")
@CrossOrigin(origins = "*")
@Tag(name = "Comentarios", description = "Sistema de valoraciones y comentarios de viajes")
public class ComentarioController {

    private final ComentarioService comentarioService;
    private final ClienteRepository clienteRepository;

    public ComentarioController(ComentarioService comentarioService, ClienteRepository clienteRepository) {
        this.comentarioService = comentarioService;
        this.clienteRepository = clienteRepository;
    }

    /**
     * Enriquece un comentario con los datos del perfil del cliente (imagenUrl, paisCodigo)
     * para que el frontend pueda mostrar la foto y la bandera del usuario.
     */
    private Map<String, Object> toResponse(Comentario c) {
        Map<String, Object> resp = new HashMap<>();
        resp.put("id", c.getId());
        resp.put("comentario", c.getComentario());
        resp.put("valoracion", c.getValoracion());
        resp.put("fechaComentario", c.getFechaComentario());
        resp.put("fechaEdicion", c.getFechaEdicion());

        // Datos del usuario + perfil del cliente
        if (c.getUsuario() != null) {
            Map<String, Object> usuario = new HashMap<>();
            usuario.put("nombre", c.getUsuario().getNombre());
            usuario.put("apellidos", c.getUsuario().getApellidos());
            usuario.put("email", c.getUsuario().getEmail());

            // Buscar el perfil del cliente para obtener imagenUrl y paisCodigo
            clienteRepository.findByUsuarioId(c.getUsuario().getId()).ifPresent(cliente -> {
                usuario.put("imagenUrl", cliente.getImagenUrl());
                usuario.put("paisCodigo", cliente.getPaisCodigo());
            });

            resp.put("usuario", usuario);
        }
        return resp;
    }

    @Operation(summary = "Comentarios de un viaje")
    @GetMapping("/viaje/{viajeId}")
    public ResponseEntity<List<Map<String, Object>>> porViaje(@PathVariable Long viajeId) {
        List<Map<String, Object>> resultado = comentarioService.obtenerPorViaje(viajeId)
                .stream().map(this::toResponse).toList();
        return ResponseEntity.ok(resultado);
    }

    @Operation(summary = "Valoración media de un viaje")
    @GetMapping("/viaje/{viajeId}/media")
    public ResponseEntity<Map<String, Object>> media(@PathVariable Long viajeId) {
        Double media = comentarioService.obtenerMediaViaje(viajeId);
        return ResponseEntity.ok(Map.of(
            "viajeId", viajeId,
            "media", media != null ? Math.round(media * 10.0) / 10.0 : 0.0
        ));
    }

    @Operation(summary = "Añadir comentario y valoración (con filtro IA)")
    @PostMapping("/viaje/{viajeId}")
    public ResponseEntity<?> crear(@PathVariable Long viajeId,
                                    @RequestBody Map<String, Object> body,
                                    Authentication auth) {
        try {
            Integer valoracion = (Integer) body.get("valoracion");
            String texto = (String) body.get("comentario");
            Comentario c = comentarioService.crear(viajeId, valoracion, texto, auth.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(c));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("Ya has publicado una opinión para este viaje.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Editar comentario propio")
    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable Long id,
                                     @RequestBody Map<String, Object> body,
                                     Authentication auth) {
        try {
            Integer valoracion = (Integer) body.get("valoracion");
            String texto = (String) body.get("comentario");
            Comentario c = comentarioService.editar(id, valoracion, texto, auth.getName());
            return ResponseEntity.ok(toResponse(c));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Eliminar comentario (admin)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        comentarioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}