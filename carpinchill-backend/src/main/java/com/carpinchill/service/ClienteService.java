package com.carpinchill.service;

import com.carpinchill.dto.request.ClienteRequest;
import com.carpinchill.model.Cliente;
import com.carpinchill.model.Usuario;
import com.carpinchill.repository.ClienteRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final UsuarioService usuarioService;

    public ClienteService(ClienteRepository clienteRepository, UsuarioService usuarioService) {
        this.clienteRepository = clienteRepository;
        this.usuarioService = usuarioService;
    }

    public List<Cliente> obtenerTodos() { return clienteRepository.findAll(); }

    public List<Cliente> obtenerActivos() { return clienteRepository.findByActivoTrue(); }

    public Cliente obtenerPorId(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
    }

    public List<Cliente> buscar(String termino) {
        return clienteRepository
            .findByUsuarioNombreContainingIgnoreCaseOrUsuarioApellidosContainingIgnoreCase(termino, termino);
    }

    public Cliente crearOActualizar(Long usuarioId, ClienteRequest request) {
        Usuario usuario = usuarioService.findByEmail(
            usuarioService.findAll().stream()
                .filter(u -> u.getId().equals(usuarioId))
                .findFirst().map(Usuario::getEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"))
        );

        Cliente cliente = clienteRepository.findByUsuarioId(usuarioId)
                .orElse(new Cliente());
        cliente.setUsuario(usuario);
        cliente.setTelefono(request.getTelefono());
        cliente.setDireccion(request.getDireccion());
        cliente.setDni(request.getDni());
        cliente.setFechaNacimiento(request.getFechaNacimiento());
        cliente.setImagenUrl(request.getImagenUrl());
        cliente.setNotas(request.getNotas());
        cliente.setActivo(true);
        return clienteRepository.save(cliente);
    }

    public void eliminar(Long id) {
        obtenerPorId(id);
        clienteRepository.deleteById(id);
    }
}
