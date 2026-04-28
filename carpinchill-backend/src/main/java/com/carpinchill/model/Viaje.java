package com.carpinchill.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

/**
 * Entidad Viaje refactorizada con Lombok.
 * @Data genera automáticamente getters, setters, equals, hashCode y toString.
 * @NoArgsConstructor genera el constructor vacío requerido por JPA.
 * El código pasa de ~130 líneas a ~60 líneas sin perder funcionalidad.
 */
@Data
@NoArgsConstructor
@Entity
@Table(name = "viaje")
public class Viaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @NotBlank
    @Column(nullable = false)
    private String destino;

    @NotBlank
    @Column(nullable = false)
    private String pais;

    private Double latitud;
    private Double longitud;

    @NotNull
    @Column(nullable = false)
    private Double precio;

    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @Column(name = "plazas_totales")
    private Integer plazasTotales;

    @Column(name = "plazas_disponibles")
    private Integer plazasDisponibles;

    @Column(name = "imagen_url")
    private String imagenUrl;

    @Column(nullable = false)
    private Boolean activo = true;
}
