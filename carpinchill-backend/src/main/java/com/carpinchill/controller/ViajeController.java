package com.carpinchill.controller;

import com.carpinchill.dto.response.ViajeResponse;
import com.carpinchill.model.Viaje;
import com.carpinchill.repository.ComentarioRepository;
import com.carpinchill.service.ViajeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/viajes")
@CrossOrigin(origins = "*")
@Tag(name = "Viajes", description = "Catálogo de viajes y paquetes turísticos")
public class ViajeController {

    private final ViajeService viajeService;
    private final ComentarioRepository comentarioRepository;

    public ViajeController(ViajeService viajeService, ComentarioRepository comentarioRepository) {
        this.viajeService = viajeService;
        this.comentarioRepository = comentarioRepository;
    }

    private ViajeResponse toResponse(Viaje v) {
        ViajeResponse r = ViajeResponse.from(v);
        // Añadir valoración media de comentarios
        Double media = comentarioRepository.calcularMediaPorViaje(v.getId());
        r.setValoracionMedia(media != null ? Math.round(media * 10.0) / 10.0 : null);
        return r;
    }

    @Operation(summary = "Catálogo de viajes activos con filtros")
    @GetMapping
    public ResponseEntity<List<ViajeResponse>> listar(
            @RequestParam(required = false) String pais,
            @RequestParam(required = false) Double precioMax,
            @RequestParam(required = false) Double precioMin,
            @RequestParam(required = false) Integer plazasMin,
            @RequestParam(required = false) String ordenar) {

        List<Viaje> viajes = viajeService.buscarConFiltros(pais, precioMin, precioMax, plazasMin, ordenar);
        return ResponseEntity.ok(viajes.stream().map(this::toResponse).toList());
    }

    @Operation(summary = "Todos los viajes incluyendo inactivos (admin)")
    @GetMapping("/todos")
    public ResponseEntity<List<ViajeResponse>> listarTodos() {
        return ResponseEntity.ok(viajeService.obtenerTodos().stream().map(this::toResponse).toList());
    }

    @Operation(summary = "Detalle de un viaje")
    @GetMapping("/{id}")
    public ResponseEntity<ViajeResponse> obtener(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(toResponse(viajeService.obtenerPorId(id)));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Crear viaje (admin/agente)")
    @PostMapping
    public ResponseEntity<ViajeResponse> crear(@Valid @RequestBody Viaje viaje) {
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(viajeService.crear(viaje)));
    }

    @Operation(summary = "Actualizar viaje")
    @PutMapping("/{id}")
    public ResponseEntity<ViajeResponse> actualizar(@PathVariable Long id, @Valid @RequestBody Viaje viaje) {
        try {
            return ResponseEntity.ok(toResponse(viajeService.actualizar(id, viaje)));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Desactivar viaje (baja lógica)")
    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        try {
            viajeService.desactivar(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Eliminar viaje (baja física)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        try {
            viajeService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
