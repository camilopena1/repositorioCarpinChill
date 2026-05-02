package com.carpinchill.model;

/**
 * Enum para el estado de una reserva.
 * Sustituye al String libre "PENDIENTE/CONFIRMADA/CANCELADA".
 * Ventaja: el compilador detecta errores de tipado, imposible
 * escribir un estado incorrecto.
 */
public enum EstadoReserva {
    PENDIENTE,
    CONFIRMADA,
    CANCELADA
}
