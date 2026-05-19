package com.carpinchill.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@NoArgsConstructor
@Entity
@Table(name = "comentario",
       uniqueConstraints = @UniqueConstraint(columnNames = {"usuario_id", "viaje_id"}))
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Comentario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "viaje_id", nullable = false)
    private Viaje viaje;

    @NotNull
    @Min(1) @Max(5)
    @Column(nullable = false)
    private Integer valoracion;

    @Column(columnDefinition = "TEXT")
    private String comentario;

    @Column(name = "fecha_comentario")
    private LocalDateTime fechaComentario = LocalDateTime.now();

    // Fecha de la última edición (null si nunca fue editado)
    @Column(name = "fecha_edicion")
    private LocalDateTime fechaEdicion;
}
