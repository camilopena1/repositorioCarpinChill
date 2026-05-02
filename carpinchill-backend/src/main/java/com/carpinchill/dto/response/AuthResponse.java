package com.carpinchill.dto.response;

import com.carpinchill.model.Usuario;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
    private String nombre;
    private String rol;
    private Long usuarioId;

    public static AuthResponse from(String token, Usuario usuario) {
        return new AuthResponse(
            token,
            usuario.getEmail(),
            usuario.getNombre(),
            usuario.getRol().name(),
            usuario.getId()
        );
    }
}
