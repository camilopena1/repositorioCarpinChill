package com.carpinchill.controller;

import com.carpinchill.model.Cliente;
import com.carpinchill.service.ClienteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "*")
@Tag(name = "Clientes", description = "Gestión CRUD de clientes (RF-02)")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @Operation(summary = "Lista todos los clientes")
    @GetMapping
    public ResponseEntity<List<Cliente>> listar() {
        return ResponseEntity.ok(clienteService.obtenerTodos());
    }

    @Operation(summary = "Buscar clientes por nombre o apellidos")
    @GetMapping("/buscar")
    public ResponseEntity<List<Cliente>> buscar(@RequestParam String q) {
        return ResponseEntity.ok(clienteService.buscar(q));
    }

    @Operation(summary = "Detalle de un cliente")
    @GetMapping("/{id}")
    public ResponseEntity<Cliente> obtener(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(clienteService.obtenerPorId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Obtener perfil de cliente por usuarioId")
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<?> obtenerPorUsuario(@PathVariable Long usuarioId) {
        return clienteService.obtenerPorUsuarioId(usuarioId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Crear o actualizar perfil de cliente")
    @PutMapping("/usuario/{usuarioId}")
    public ResponseEntity<?> crearOActualizar(@PathVariable Long usuarioId,
                                               @RequestBody Map<String, String> datos) {
        try {
            Cliente c = clienteService.crearOActualizar(
                usuarioId,
                datos.get("telefono"),
                datos.get("direccion"),
                datos.get("dni"),
                datos.get("fechaNacimiento"),
                datos.get("imagenUrl"),
                datos.get("notas")
            );
            return ResponseEntity.ok(c);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Eliminar cliente")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        try {
            clienteService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}