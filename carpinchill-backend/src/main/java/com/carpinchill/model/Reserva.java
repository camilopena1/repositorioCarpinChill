package com.carpinchill.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

/**
 * Entidad JPA que representa una reserva de viaje.
 *
 * Relaciones:
 *   - ManyToOne con Viaje: un viaje puede tener muchas reservas.
 *   - El usuario se referencia por ID (Long usuarioId) porque los
 *     usuarios están en memoria en esta entrega, no en BD.
 *     En la siguiente entrega se creará la entidad Usuario en BD
 *     y se convertirá en una relación ManyToOne real.
 */
@Entity
@Table(name = "reserva")
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Referencia al usuario que hace la reserva.
     * Por ahora es un Long porque los usuarios están en memoria.
     */
    @NotNull(message = "El usuario es obligatorio")
    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    /**
     * Viaje reservado. Relación Many-to-One:
     * muchas reservas pueden apuntar al mismo viaje.
     */
    @NotNull(message = "El viaje es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "viaje_id", nullable = false)
    private Viaje viaje;

    @Column(name = "fecha_reserva", nullable = false)
    private LocalDate fechaReserva;

    @NotNull
    @Min(value = 1, message = "Debe reservar al menos 1 plaza")
    @Column(name = "num_personas", nullable = false)
    private Integer numPersonas;

    /**
     * Precio total calculado en el momento de la reserva.
     * Se calcula como: viaje.precio × numPersonas.
     * Se guarda para que no varíe si el precio del viaje cambia.
     */
    @Column(name = "precio_total", nullable = false)
    private Double precioTotal;

    /**
     * Estado de la reserva.
     * Valores posibles: PENDIENTE, CONFIRMADA, CANCELADA.
     */
    @Column(nullable = false)
    private String estado = "PENDIENTE";

    // Notas o peticiones especiales del cliente
    @Column(length = 500)
    private String notas;

    // ---- Constructor vacío (requerido por JPA) ----
    public Reserva() {}

    // ---- Getters y Setters ----

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public Viaje getViaje() { return viaje; }
    public void setViaje(Viaje viaje) { this.viaje = viaje; }

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
