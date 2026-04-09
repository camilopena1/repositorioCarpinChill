package com.carpinchill.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

/**
 * Entidad que representa un viaje/paquete turístico.
 * @Table(name = "viaje") crea la tabla "viaje" en H2 automáticamente.
 */
@Entity
@Table(name = "viaje")
public class Viaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El título es obligatorio")
    @Column(nullable = false)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @NotBlank(message = "El destino es obligatorio")
    @Column(nullable = false)
    private String destino;

    @NotBlank(message = "El país es obligatorio")
    @Column(nullable = false)
    private String pais;

    // Coordenadas para el mapa (Leaflet las usará después)
    private Double latitud;
    private Double longitud;

    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.0", message = "El precio no puede ser negativo")
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

    // Si está activo o fue dado de baja lógica
    @Column(nullable = false)
    private Boolean activo = true;

    // ---- Constructores ----

    public Viaje() {}

    public Viaje(String titulo, String descripcion, String destino, String pais,
                 Double latitud, Double longitud, Double precio,
                 LocalDate fechaInicio, LocalDate fechaFin,
                 Integer plazasTotales, Integer plazasDisponibles,
                 String imagenUrl) {
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.destino = destino;
        this.pais = pais;
        this.latitud = latitud;
        this.longitud = longitud;
        this.precio = precio;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.plazasTotales = plazasTotales;
        this.plazasDisponibles = plazasDisponibles;
        this.imagenUrl = imagenUrl;
        this.activo = true;
    }

    // ---- Getters y Setters ----

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getDestino() { return destino; }
    public void setDestino(String destino) { this.destino = destino; }

    public String getPais() { return pais; }
    public void setPais(String pais) { this.pais = pais; }

    public Double getLatitud() { return latitud; }
    public void setLatitud(Double latitud) { this.latitud = latitud; }

    public Double getLongitud() { return longitud; }
    public void setLongitud(Double longitud) { this.longitud = longitud; }

    public Double getPrecio() { return precio; }
    public void setPrecio(Double precio) { this.precio = precio; }

    public LocalDate getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDate fechaInicio) { this.fechaInicio = fechaInicio; }

    public LocalDate getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDate fechaFin) { this.fechaFin = fechaFin; }

    public Integer getPlazasTotales() { return plazasTotales; }
    public void setPlazasTotales(Integer plazasTotales) { this.plazasTotales = plazasTotales; }

    public Integer getPlazasDisponibles() { return plazasDisponibles; }
    public void setPlazasDisponibles(Integer plazasDisponibles) { this.plazasDisponibles = plazasDisponibles; }

    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
}
