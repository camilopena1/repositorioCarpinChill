package com.carpinchill.controller;

import com.carpinchill.model.Viaje;
import com.carpinchill.service.ViajeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para Viaje.
 *
 * Endpoints disponibles:
 *   GET    /api/viajes              → lista todos los viajes activos
 *   GET    /api/viajes/todos        → lista todos (activos e inactivos) — solo admin
 *   GET    /api/viajes/{id}         → obtiene un viaje por ID
 *   GET    /api/viajes?pais=Francia → filtra por país
 *   GET    /api/viajes?precioMax=1000 → filtra por precio máximo
 *   POST   /api/viajes              → crea un nuevo viaje
 *   PUT    /api/viajes/{id}         → actualiza un viaje existente
 *   DELETE /api/viajes/{id}         → elimina un viaje (baja física)
 *   PATCH  /api/viajes/{id}/desactivar → baja lógica
 */
@RestController
@RequestMapping("/api/viajes")
@CrossOrigin(origins = "*") // Permite peticiones desde Angular en cualquier puerto
public class ViajeController {

    private final ViajeService viajeService;

    public ViajeController(ViajeService viajeService) {
        this.viajeService = viajeService;
    }

    // ---- GET /api/viajes ----
    // Devuelve viajes activos. Si se pasa ?pais=X o ?precioMax=Y filtra.
    @GetMapping
    public ResponseEntity<List<Viaje>> listar(
            @RequestParam(required = false) String pais,
            @RequestParam(required = false) Double precioMax) {

        List<Viaje> viajes;

        if (pais != null) {
            viajes = viajeService.buscarPorPais(pais);
        } else if (precioMax != null) {
            viajes = viajeService.buscarPorPrecioMaximo(precioMax);
        } else {
            viajes = viajeService.obtenerActivos();
        }

        return ResponseEntity.ok(viajes);
    }

    // ---- GET /api/viajes/todos ----
    // Lista todos incluyendo inactivos (para el panel de administración)
    @GetMapping("/todos")
    public ResponseEntity<List<Viaje>> listarTodos() {
        return ResponseEntity.ok(viajeService.obtenerTodos());
    }

    // ---- GET /api/viajes/{id} ----
    @GetMapping("/{id}")
    public ResponseEntity<Viaje> obtenerPorId(@PathVariable Long id) {
        try {
            Viaje viaje = viajeService.obtenerPorId(id);
            return ResponseEntity.ok(viaje);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build(); // 404
        }
    }

    // ---- POST /api/viajes ----
    // Body: JSON con los datos del viaje
    @PostMapping
    public ResponseEntity<Viaje> crear(@Valid @RequestBody Viaje viaje) {
        Viaje nuevo = viajeService.crear(viaje);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo); // 201
    }

    // ---- PUT /api/viajes/{id} ----
    // Body: JSON con todos los datos actualizados
    @PutMapping("/{id}")
    public ResponseEntity<Viaje> actualizar(@PathVariable Long id,
                                             @Valid @RequestBody Viaje viaje) {
        try {
            Viaje actualizado = viajeService.actualizar(id, viaje);
            return ResponseEntity.ok(actualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build(); // 404
        }
    }

    // ---- DELETE /api/viajes/{id} ----
    // Baja física: elimina de la BD
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        try {
            viajeService.eliminar(id);
            return ResponseEntity.noContent().build(); // 204
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build(); // 404
        }
    }

    // ---- PATCH /api/viajes/{id}/desactivar ----
    // Baja lógica: marca como inactivo sin borrar
    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        try {
            viajeService.desactivar(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
