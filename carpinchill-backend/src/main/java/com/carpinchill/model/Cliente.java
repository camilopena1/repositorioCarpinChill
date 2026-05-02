package com.carpinchill.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Perfil de cliente vinculado a un Usuario (relación 1:1).
 * Contiene información adicional del cliente de la agencia.
 */
@Data
@NoArgsConstructor
@Entity
@Table(name = "cliente")
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @Column(length = 15)
    private String telefono;

    @Column(length = 200)
    private String direccion;

    @Column(unique = true, length = 9)
    private String dni;

    @Column(name = "fecha_nacimiento")
    private String fechaNacimiento;

    @Column(name = "imagen_url")
    private String imagenUrl;

    @Column(length = 500)
    private String notas;

    @Column(nullable = false)
    private Boolean activo = true;
}
