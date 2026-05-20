package com.carpinchill.service;

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

    public List<Cliente> obtenerTodos() {
        return clienteRepository.findAll();
    }

    public List<Cliente> obtenerActivos() {
        return clienteRepository.findByActivoTrue();
    }

    public Cliente obtenerPorId(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
    }

    public List<Cliente> buscar(String termino) {
        return clienteRepository
            .findByUsuarioNombreContainingIgnoreCaseOrUsuarioApellidosContainingIgnoreCase(termino, termino);
    }

    public java.util.Optional<Cliente> obtenerPorUsuarioId(Long usuarioId) {
        return clienteRepository.findByUsuarioId(usuarioId);
    }

    public Cliente crearOActualizar(Long usuarioId, String telefono, String direccion,
                                     String dni, String fechaNacimiento, String imagenUrl,
                                     String notas, String paisCodigo) {
        Usuario usuario = usuarioService.findAll().stream()
                .filter(u -> u.getId().equals(usuarioId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Cliente cliente = clienteRepository.findByUsuarioId(usuarioId)
                .orElse(new Cliente());
        cliente.setUsuario(usuario);
        cliente.setTelefono(telefono);
        cliente.setDireccion(direccion);
        cliente.setDni(dni);
        cliente.setFechaNacimiento(fechaNacimiento);
        cliente.setImagenUrl(imagenUrl);
        cliente.setNotas(notas);
        cliente.setPaisCodigo(paisCodigo);
        cliente.setActivo(true);
        return clienteRepository.save(cliente);
    }

    public void eliminar(Long id) {
        obtenerPorId(id);
        clienteRepository.deleteById(id);
    }
}