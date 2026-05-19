package com.carpinchill.controller;

import com.carpinchill.model.Comentario;
import com.carpinchill.service.ComentarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comentarios")
@CrossOrigin(origins = "*")
@Tag(name = "Comentarios", description = "Sistema de valoraciones y comentarios de viajes")
public class ComentarioController {

    private final ComentarioService comentarioService;

    public ComentarioController(ComentarioService comentarioService) {
        this.comentarioService = comentarioService;
    }

    @Operation(summary = "Comentarios de un viaje")
    @GetMapping("/viaje/{viajeId}")
    public ResponseEntity<List<Comentario>> porViaje(@PathVariable Long viajeId) {
        return ResponseEntity.ok(comentarioService.obtenerPorViaje(viajeId));
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
            return ResponseEntity.status(HttpStatus.CREATED).body(c);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("Ya has publicado una opinión para este viaje. Solo se permite una valoración por viaje.");
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
            return ResponseEntity.ok(c);
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
