package com.carpinchill.controller;

import com.carpinchill.security.SecurityConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/clima")
@CrossOrigin(origins = "*")
@Tag(name = "Clima", description = "Información meteorológica via OpenWeatherMap (RF-07)")
public class ClimaController {

    @Value("${openweather.api.key}")
    private String apiKey;

    @Value("${openweather.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final SecurityConfig securityConfig;
    private final Map<String, Map<String, Object>> cache = new ConcurrentHashMap<>();
    private static final long CACHE_MINUTOS = 30;

    public ClimaController(SecurityConfig securityConfig) {
        this.securityConfig = securityConfig;
    }

    @Operation(summary = "Clima actual por coordenadas", description = "Caché de 30 min. Rate limit: 20 req/min por IP.")
    @GetMapping
    public ResponseEntity<?> getClima(@RequestParam double lat, @RequestParam double lon,
                                       HttpServletRequest request) {
        if (!securityConfig.getBucketParaIp(request.getRemoteAddr()).tryConsume(1)) {
            return ResponseEntity.status(429).body(Map.of("error", "Demasiadas peticiones"));
        }

        String key = lat + "," + lon;
        if (cache.containsKey(key)) {
            Map<String, Object> cached = cache.get(key);
            LocalDateTime ts = (LocalDateTime) cached.get("timestamp");
            if (ts.plusMinutes(CACHE_MINUTOS).isAfter(LocalDateTime.now())) {
                Map<String, Object> r = new HashMap<>(cached);
                r.put("desdecache", true);
                r.remove("timestamp");
                return ResponseEntity.ok(r);
            }
        }

        try {
            String url = String.format("%s/weather?lat=%s&lon=%s&appid=%s&units=metric&lang=es",
                    apiUrl, lat, lon, apiKey);
            @SuppressWarnings("unchecked")
            Map<String, Object> owm = restTemplate.getForObject(url, Map.class);
            if (owm == null) return ResponseEntity.status(503).body(Map.of("error", "Sin datos"));

            @SuppressWarnings("unchecked")
            Map<String, Object> main = (Map<String, Object>) owm.get("main");
            @SuppressWarnings("unchecked")
            Map<String, Object> wind = (Map<String, Object>) owm.get("wind");
            @SuppressWarnings("unchecked")
            java.util.List<Map<String, Object>> weather = (java.util.List<Map<String, Object>>) owm.get("weather");

            Map<String, Object> datos = new HashMap<>();
            datos.put("ciudad", owm.get("name"));
            datos.put("temperatura", main.get("temp"));
            datos.put("sensacionTermica", main.get("feels_like"));
            datos.put("descripcion", weather.get(0).get("description"));
            datos.put("icono", weather.get(0).get("icon"));
            datos.put("humedad", main.get("humidity"));
            datos.put("viento", wind.get("speed"));
            datos.put("timestamp", LocalDateTime.now());
            cache.put(key, datos);

            Map<String, Object> r = new HashMap<>(datos);
            r.put("desdecache", false);
            r.remove("timestamp");
            return ResponseEntity.ok(r);
        } catch (Exception e) {
            return ResponseEntity.status(503).body(Map.of("error", "Error al obtener el clima"));
        }
    }
}
