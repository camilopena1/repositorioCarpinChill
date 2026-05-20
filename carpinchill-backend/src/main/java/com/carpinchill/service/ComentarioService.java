package com.carpinchill.service;

import com.carpinchill.model.Comentario;
import com.carpinchill.model.Usuario;
import com.carpinchill.model.Viaje;
import com.carpinchill.repository.ComentarioRepository;
import com.carpinchill.repository.ViajeRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class ComentarioService {

    private final ComentarioRepository comentarioRepository;
    private final ViajeRepository viajeRepository;
    private final UsuarioService usuarioService;
    private final RestTemplate restTemplate;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    public ComentarioService(ComentarioRepository comentarioRepository,
                              ViajeRepository viajeRepository,
                              UsuarioService usuarioService) {
        this.comentarioRepository = comentarioRepository;
        this.viajeRepository = viajeRepository;
        this.usuarioService = usuarioService;
        this.restTemplate = new RestTemplate();
    }

    public List<Comentario> obtenerPorViaje(Long viajeId) {
        return comentarioRepository.findByViajeId(viajeId);
    }

    public Double obtenerMediaViaje(Long viajeId) {
        return comentarioRepository.calcularMediaPorViaje(viajeId);
    }

    /**
     * Llama a la API de Google Gemini para verificar si el comentario es apropiado.
     * Si la clave no está configurada, permite el comentario directamente.
     */
    private boolean esComentarioApropiado(String texto) {
        if (geminiApiKey == null || geminiApiKey.isBlank()) return true;
        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String prompt = "Eres un moderador de contenido para una agencia de viajes. " +
                "Analiza el siguiente comentario y determina si es apropiado. " +
                "Es INAPROPIADO si contiene insultos, spam, odio o amenazas. " +
                "Responde ÚNICAMENTE con una sola palabra: APROPIADO o INAPROPIADO.\n\n" +
                "Comentario: \"" + texto + "\"";

            Map<String, Object> body = Map.of(
                "contents", List.of(Map.of(
                    "parts", List.of(Map.of("text", prompt))
                ))
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    String respuesta = parts.get(0).get("text").toString().trim().toUpperCase();
                    return respuesta.contains("APROPIADO") && !respuesta.contains("INAPROPIADO");
                }
            }
        } catch (Exception e) {
            System.err.println("Error API moderación Gemini: " + e.getMessage());
        }
        return true;
    }

    public Comentario crear(Long viajeId, Integer valoracion, String texto, String emailUsuario) {
        if (texto != null && !texto.isBlank() && !esComentarioApropiado(texto)) {
            throw new RuntimeException("Tu comentario contiene contenido inapropiado y no pudo publicarse.");
        }

        Usuario usuario = usuarioService.findByEmail(emailUsuario);
        Viaje viaje = viajeRepository.findById(viajeId)
                .orElseThrow(() -> new RuntimeException("Viaje no encontrado"));

        Comentario c = new Comentario();
        c.setUsuario(usuario);
        c.setViaje(viaje);
        c.setValoracion(valoracion);
        c.setComentario(texto);
        c.setFechaComentario(LocalDateTime.now());
        return comentarioRepository.save(c);
    }

    public Comentario editar(Long comentarioId, Integer valoracion, String texto, String emailUsuario) {
        Comentario c = comentarioRepository.findById(comentarioId)
                .orElseThrow(() -> new RuntimeException("Comentario no encontrado"));

        if (!c.getUsuario().getEmail().equals(emailUsuario)) {
            throw new RuntimeException("No tienes permiso para editar este comentario");
        }
        if (texto != null && !texto.isBlank() && !esComentarioApropiado(texto)) {
            throw new RuntimeException("Tu comentario contiene contenido inapropiado y no pudo publicarse.");
        }

        c.setValoracion(valoracion);
        c.setComentario(texto);
        c.setFechaEdicion(LocalDateTime.now());
        return comentarioRepository.save(c);
    }

    public void eliminar(Long id) {
        comentarioRepository.deleteById(id);
    }
}
