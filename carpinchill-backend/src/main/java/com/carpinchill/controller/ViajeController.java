package com.carpinchill.controller;

import com.carpinchill.dto.ViajeDTO;
import com.carpinchill.model.Viaje;
import com.carpinchill.service.ViajeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para Viaje.
 *   - Ahora devuelve ViajeDTO en lugar de la entidad Viaje directamente.
 *   - Anotaciones @Operation de Swagger para documentación automática.
 *
 * Endpoints:
 *   GET    /api/viajes              → lista viajes activos (con filtros opcionales)
 *   GET    /api/viajes/todos        → lista todos, activos e inactivos (admin)
 *   GET    /api/viajes/{id}         → detalle de un viaje
 *   POST   /api/viajes              → crea un viaje
 *   PUT    /api/viajes/{id}         → actualiza un viaje
 *   DELETE /api/viajes/{id}         → elimina un viaje (baja física)
 *   PATCH  /api/viajes/{id}/desactivar → baja lógica
 */
@RestController
@RequestMapping("/api/viajes")
@CrossOrigin(origins = "*")
@Tag(name = "Viajes", description = "Catálogo de viajes y paquetes turísticos")
public class ViajeController {

    private final ViajeService viajeService;

    public ViajeController(ViajeService viajeService) {
        this.viajeService = viajeService;
    }

    // Método privado que convierte Viaje → ViajeDTO
    // Esto sustituye a MapStruct para no añadir más dependencias.
    // El resultado es el mismo: la entidad JPA nunca sale del backend.
    private ViajeDTO toDTO(Viaje v) {
        ViajeDTO dto = new ViajeDTO();
        dto.setId(v.getId());
        dto.setTitulo(v.getTitulo());
        dto.setDescripcion(v.getDescripcion());
        dto.setDestino(v.getDestino());
        dto.setPais(v.getPais());
        dto.setLatitud(v.getLatitud());
        dto.setLongitud(v.getLongitud());
        dto.setPrecio(v.getPrecio());
        dto.setFechaInicio(v.getFechaInicio());
        dto.setFechaFin(v.getFechaFin());
        dto.setPlazasTotales(v.getPlazasTotales());
        dto.setPlazasDisponibles(v.getPlazasDisponibles());
        dto.setImagenUrl(v.getImagenUrl());
        dto.setActivo(v.getActivo());
        // Campo calculado que no está en la entidad
        if (v.getPlazasTotales() != null && v.getPlazasDisponibles() != null) {
            dto.setPlazasOcupadas(v.getPlazasTotales() - v.getPlazasDisponibles());
        }
        return dto;
    }

    // Convierte lista de Viaje → lista de ViajeDTO
    private List<ViajeDTO> toDTOList(List<Viaje> viajes) {
        return viajes.stream().map(this::toDTO).toList();
    }

    // GET /api/viajes
    @Operation(
        summary = "Lista viajes activos",
        description = "Devuelve todos los viajes activos del catálogo. " +
                      "Acepta filtros opcionales: ?pais=Francia o ?precioMax=1000"
    )
    @ApiResponse(responseCode = "200", description = "Lista obtenida correctamente")
    @GetMapping
    public ResponseEntity<List<ViajeDTO>> listar(
            @Parameter(description = "Filtrar por país (búsqueda parcial)")
            @RequestParam(required = false) String pais,
            @Parameter(description = "Filtrar por precio máximo en euros")
            @RequestParam(required = false) Double precioMax) {

        List<Viaje> viajes;
        if (pais != null) {
            viajes = viajeService.buscarPorPais(pais);
        } else if (precioMax != null) {
            viajes = viajeService.buscarPorPrecioMaximo(precioMax);
        } else {
            viajes = viajeService.obtenerActivos();
        }
        return ResponseEntity.ok(toDTOList(viajes));
    }

    // GET /api/viajes/todos
    @Operation(summary = "Lista todos los viajes (admin)",
               description = "Incluye viajes inactivos. Solo para el panel de administración.")
    @GetMapping("/todos")
    public ResponseEntity<List<ViajeDTO>> listarTodos() {
        return ResponseEntity.ok(toDTOList(viajeService.obtenerTodos()));
    }

    // GET /api/viajes/{id}
    @Operation(summary = "Detalle de un viaje", description = "Busca un viaje por su ID.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Viaje encontrado"),
        @ApiResponse(responseCode = "404", description = "Viaje no encontrado")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ViajeDTO> obtenerPorId(
            @Parameter(description = "ID del viaje") @PathVariable Long id) {
        try {
            return ResponseEntity.ok(toDTO(viajeService.obtenerPorId(id)));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // POST /api/viajes
    @Operation(summary = "Crea un nuevo viaje", description = "Requiere autenticación.")
    @ApiResponse(responseCode = "201", description = "Viaje creado correctamente")
    @PostMapping
    public ResponseEntity<ViajeDTO> crear(@Valid @RequestBody Viaje viaje) {
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(viajeService.crear(viaje)));
    }

    // PUT /api/viajes/{id}
    @Operation(summary = "Actualiza un viaje existente", description = "Requiere autenticación.")
    @PutMapping("/{id}")
    public ResponseEntity<ViajeDTO> actualizar(
            @PathVariable Long id, @Valid @RequestBody Viaje viaje) {
        try {
            return ResponseEntity.ok(toDTO(viajeService.actualizar(id, viaje)));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE /api/viajes/{id}
    @Operation(summary = "Elimina un viaje", description = "Baja física. Requiere autenticación.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        try {
            viajeService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // PATCH /api/viajes/{id}/desactivar
    @Operation(summary = "Desactiva un viaje",
               description = "Baja lógica: el viaje deja de aparecer en el catálogo pero no se borra de la BD.")
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
