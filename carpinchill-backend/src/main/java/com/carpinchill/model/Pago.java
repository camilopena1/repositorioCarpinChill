package com.carpinchill.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Entidad Pago — Simulador de pagos con tarjeta.
 * Registra cada intento de pago asociado a una reserva.
 * En producción real este módulo se sustituiría por la integración con Stripe o PayPal.
 */
@Data
@NoArgsConstructor
@Entity
@Table(name = "pago")
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reserva_id", nullable = false)
    private Reserva reserva;

    @Column(nullable = false)
    private Double importe;

    // COMPLETADO o RECHAZADO
    @Column(nullable = false, length = 20)
    private String estado;

    @Column(name = "fecha_pago", nullable = false)
    private LocalDateTime fechaPago = LocalDateTime.now();

    // Solo los últimos 4 dígitos de la tarjeta (nunca el número completo)
    @Column(name = "ultimos_digitos", length = 4)
    private String ultimosDigitos;

    // Nombre del titular tal como lo introdujo el usuario
    @Column(name = "nombre_titular", length = 100)
    private String nombreTitular;

    // Mensaje descriptivo del resultado (éxito o motivo de rechazo)
    @Column(length = 200)
    private String mensaje;
}
