package com.carpinchill.service;

import com.carpinchill.dto.request.RegistroRequest;
import com.carpinchill.model.Usuario;
import com.carpinchill.repository.UsuarioRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          PasswordEncoder passwordEncoder,
                          EmailService emailService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + email));
        return new User(
                usuario.getEmail(),
                usuario.getPasswordHash(),
                List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getRol().name()))
        );
    }

    public Usuario registrar(RegistroRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Ya existe una cuenta con ese email");
        }
        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setApellidos(request.getApellidos());
        usuario.setEmail(request.getEmail());
        usuario.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        usuario.setRol(Usuario.Rol.CLIENTE);

        Usuario guardado = usuarioRepository.save(usuario);
        emailService.enviarBienvenida(guardado);
        return guardado;
    }

    /**
     * Crea un nuevo agente. Solo accesible desde el panel de administración.
     */
    public Usuario crearAgente(String nombre, String apellidos, String email, String password) {
        if (usuarioRepository.existsByEmail(email)) {
            throw new RuntimeException("Ya existe una cuenta con ese email");
        }
        Usuario usuario = new Usuario();
        usuario.setNombre(nombre);
        usuario.setApellidos(apellidos);
        usuario.setEmail(email);
        usuario.setPasswordHash(passwordEncoder.encode(password));
        usuario.setRol(Usuario.Rol.AGENTE);

        Usuario guardado = usuarioRepository.save(usuario);
        emailService.enviarBienvenida(guardado);
        return guardado;
    }

    public void desactivarAgente(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        if (usuario.getRol() != Usuario.Rol.AGENTE) {
            throw new RuntimeException("El usuario no es un agente");
        }
        usuario.setActivo(false);
        usuarioRepository.save(usuario);
    }

    public List<Usuario> listarAgentes() {
        return usuarioRepository.findAll().stream()
                .filter(u -> u.getRol() == Usuario.Rol.AGENTE)
                .collect(java.util.stream.Collectors.toList());
    }

    public Usuario findByEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    public List<Usuario> findAll() {
        return usuarioRepository.findAll();
    }
}