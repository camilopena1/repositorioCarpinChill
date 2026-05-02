package com.carpinchill.dto.response;

import com.carpinchill.model.EstadoReserva;
import com.carpinchill.model.Reserva;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReservaResponse {
    private Long id;
    private Long usuarioId;
    private String nombreUsuario;
    private Long viajeId;
    private String tituloViaje;
    private LocalDateTime fechaReserva;
    private Integer numPersonas;
    private Double precioTotal;
    private EstadoReserva estado;
    private String notas;

    public static ReservaResponse from(Reserva r) {
        ReservaResponse dto = new ReservaResponse();
        dto.setId(r.getId());
        dto.setUsuarioId(r.getUsuario().getId());
        dto.setNombreUsuario(r.getUsuario().getNombre() + " " + r.getUsuario().getApellidos());
        dto.setViajeId(r.getViaje().getId());
        dto.setTituloViaje(r.getViaje().getTitulo());
        dto.setFechaReserva(r.getFechaReserva());
        dto.setNumPersonas(r.getNumPersonas());
        dto.setPrecioTotal(r.getPrecioTotal());
        dto.setEstado(r.getEstado());
        dto.setNotas(r.getNotas());
        return dto;
    }
}
