package com.carpinchill.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

/**
 * DTO para Reserva.
 * Se usa tanto para recibir datos del frontend (crear reserva)
 * como para devolver información al frontend (consultar reserva).
 */
public class ReservaDTO {

    private Long id;

    // ID del usuario que hace la reserva (viene del frontend o del token)
    @NotNull(message = "El usuario es obligatorio")
    private Long usuarioId;

    // ID del viaje que se reserva
    @NotNull(message = "El viaje es obligatorio")
    private Long viajeId;

    // Campos informativos (solo en respuestas, no en peticiones)
    private String nombreUsuario;
    private String tituloViaje;

    private LocalDate fechaReserva;

    @NotNull(message = "El número de personas es obligatorio")
    @Min(value = 1, message = "Debe reservar al menos 1 plaza")
    private Integer numPersonas;

    // Calculado en el backend: precio del viaje × numPersonas
    private Double precioTotal;

    // PENDIENTE / CONFIRMADA / CANCELADA
    private String estado;

    private String notas;

    // ---- Constructor vacío ----
    public ReservaDTO() {}

    // ---- Getters y Setters ----

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public Long getViajeId() { return viajeId; }
    public void setViajeId(Long viajeId) { this.viajeId = viajeId; }

    public String getNombreUsuario() { return nombreUsuario; }
    public void setNombreUsuario(String nombreUsuario) { this.nombreUsuario = nombreUsuario; }

    public String getTituloViaje() { return tituloViaje; }
    public void setTituloViaje(String tituloViaje) { this.tituloViaje = tituloViaje; }

    public LocalDate getFechaReserva() { return fechaReserva; }
    public void setFechaReserva(LocalDate fechaReserva) { this.fechaReserva = fechaReserva; }

    public Integer getNumPersonas() { return numPersonas; }
    public void setNumPersonas(Integer numPersonas) { this.numPersonas = numPersonas; }

    public Double getPrecioTotal() { return precioTotal; }
    public void setPrecioTotal(Double precioTotal) { this.precioTotal = precioTotal; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getNotas() { return notas; }
    public void setNotas(String notas) { this.notas = notas; }
}
