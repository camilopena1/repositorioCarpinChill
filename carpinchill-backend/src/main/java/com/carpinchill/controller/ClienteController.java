package com.carpinchill.controller;

import com.carpinchill.dto.request.ClienteRequest;
import com.carpinchill.dto.response.ClienteResponse;
import com.carpinchill.service.ClienteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<List<ClienteResponse>> listar() {
        return ResponseEntity.ok(clienteService.obtenerTodos().stream()
                .map(ClienteResponse::from).toList());
    }

    @Operation(summary = "Buscar clientes por nombre o apellidos")
    @GetMapping("/buscar")
    public ResponseEntity<List<ClienteResponse>> buscar(@RequestParam String q) {
        return ResponseEntity.ok(clienteService.buscar(q).stream()
                .map(ClienteResponse::from).toList());
    }

    @Operation(summary = "Detalle de un cliente")
    @GetMapping("/{id}")
    public ResponseEntity<ClienteResponse> obtener(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(ClienteResponse.from(clienteService.obtenerPorId(id)));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Crear o actualizar perfil de cliente")
    @PutMapping("/usuario/{usuarioId}")
    public ResponseEntity<?> crearOActualizar(@PathVariable Long usuarioId,
                                               @RequestBody ClienteRequest request) {
        try {
            return ResponseEntity.ok(ClienteResponse.from(
                    clienteService.crearOActualizar(usuarioId, request)));
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
