package com.carpinchill.dto.response;

import com.carpinchill.model.Viaje;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ViajeResponse {
    private Long id;
    private String titulo;
    private String descripcion;
    private String destino;
    private String pais;
    private Double latitud;
    private Double longitud;
    private Double precio;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private Integer plazasTotales;
    private Integer plazasDisponibles;
    private Integer plazasOcupadas;
    private String imagenUrl;
    private Boolean activo;
    private Double valoracionMedia;

    public static ViajeResponse from(Viaje v) {
        ViajeResponse dto = new ViajeResponse();
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
        if (v.getPlazasTotales() != null && v.getPlazasDisponibles() != null) {
            dto.setPlazasOcupadas(v.getPlazasTotales() - v.getPlazasDisponibles());
        }
        return dto;
    }
}
