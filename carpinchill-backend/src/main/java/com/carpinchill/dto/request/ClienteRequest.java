package com.carpinchill.dto.request;

import lombok.Data;

@Data
public class ClienteRequest {
    private String telefono;
    private String direccion;
    private String dni;
    private String fechaNacimiento;
    private String imagenUrl;
    private String notas;
}
