package com.carpinchill.dto.response;

import com.carpinchill.model.Cliente;
import lombok.Data;

@Data
public class ClienteResponse {
    private Long id;
    private Long usuarioId;
    private String nombreCompleto;
    private String email;
    private String telefono;
    private String direccion;
    private String dni;
    private String fechaNacimiento;
    private String imagenUrl;
    private String notas;
    private Boolean activo;

    public static ClienteResponse from(Cliente c) {
        ClienteResponse dto = new ClienteResponse();
        dto.setId(c.getId());
        dto.setUsuarioId(c.getUsuario().getId());
        dto.setNombreCompleto(c.getUsuario().getNombre() + " " + c.getUsuario().getApellidos());
        dto.setEmail(c.getUsuario().getEmail());
        dto.setTelefono(c.getTelefono());
        dto.setDireccion(c.getDireccion());
        dto.setDni(c.getDni());
        dto.setFechaNacimiento(c.getFechaNacimiento());
        dto.setImagenUrl(c.getImagenUrl());
        dto.setNotas(c.getNotas());
        dto.setActivo(c.getActivo());
        return dto;
    }
}
