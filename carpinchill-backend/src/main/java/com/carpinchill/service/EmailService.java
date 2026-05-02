package com.carpinchill.service;

import com.carpinchill.model.Reserva;
import com.carpinchill.model.Usuario;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Servicio de envío de emails.
 *
 * Envía emails automáticamente en estos momentos:
 *   - Registro de nuevo usuario
 *   - Confirmación de reserva
 *   - Cancelación de reserva
 *
 * Los emails se envían de forma asíncrona (@Async) para no
 * bloquear la respuesta HTTP mientras el servidor de correo
 * procesa el mensaje.
 */
@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${carpinchill.mail.from}")
    private String from;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Email de bienvenida tras el registro.
     */
    @Async
    public void enviarBienvenida(Usuario usuario) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(from);
            msg.setTo(usuario.getEmail());
            msg.setSubject("¡Bienvenido a CarpinChill!");
            msg.setText(
                "Hola " + usuario.getNombre() + ",\n\n" +
                "Tu cuenta ha sido creada correctamente en CarpinChill.\n\n" +
                "Ya puedes explorar nuestro catálogo de viajes y realizar reservas.\n\n" +
                "Un saludo,\n" +
                "El equipo de CarpinChill\n" +
                "https://carpinchill-frontend.onrender.com"
            );
            mailSender.send(msg);
        } catch (Exception e) {
            // Si el email falla no interrumpimos el flujo principal
            System.err.println("Error enviando email de bienvenida: " + e.getMessage());
        }
    }

    /**
     * Email de confirmación de reserva.
     */
    @Async
    public void enviarConfirmacionReserva(Reserva reserva) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(from);
            msg.setTo(reserva.getUsuario().getEmail());
            msg.setSubject("Reserva confirmada — " + reserva.getViaje().getTitulo());
            msg.setText(
                "Hola " + reserva.getUsuario().getNombre() + ",\n\n" +
                "Tu reserva ha sido CONFIRMADA.\n\n" +
                "Detalles de tu reserva:\n" +
                "  Viaje: " + reserva.getViaje().getTitulo() + "\n" +
                "  Destino: " + reserva.getViaje().getDestino() + ", " + reserva.getViaje().getPais() + "\n" +
                "  Personas: " + reserva.getNumPersonas() + "\n" +
                "  Total: " + reserva.getPrecioTotal() + " €\n" +
                "  Estado: CONFIRMADA\n\n" +
                "¡Que disfrutes del viaje!\n\n" +
                "El equipo de CarpinChill"
            );
            mailSender.send(msg);
        } catch (Exception e) {
            System.err.println("Error enviando email de confirmación: " + e.getMessage());
        }
    }

    /**
     * Email de cancelación de reserva.
     */
    @Async
    public void enviarCancelacionReserva(Reserva reserva) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(from);
            msg.setTo(reserva.getUsuario().getEmail());
            msg.setSubject("Reserva cancelada — " + reserva.getViaje().getTitulo());
            msg.setText(
                "Hola " + reserva.getUsuario().getNombre() + ",\n\n" +
                "Tu reserva para el viaje \"" + reserva.getViaje().getTitulo() + "\" ha sido cancelada.\n\n" +
                "Si tienes alguna duda, no dudes en contactarnos.\n\n" +
                "El equipo de CarpinChill"
            );
            mailSender.send(msg);
        } catch (Exception e) {
            System.err.println("Error enviando email de cancelación: " + e.getMessage());
        }
    }
}
