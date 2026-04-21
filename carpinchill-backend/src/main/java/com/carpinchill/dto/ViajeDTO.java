package com.carpinchill.dto;

import java.time.LocalDate;

/*
 * DTO (Data Transfer Object) para Viaje.
 *   - Controlamos exactamente qué campos se exponen al exterior.
 *   - Podemos cambiar la BD sin romper la API.
 *   - Podemos incluir campos calculados (por ejemplo: plazasOcupadas).
*/
public class ViajeDTO {

    private Long id;
    private String titulo;
    private String descripcion;
    private String destino;
    private String pais;
    private Double latitud;
    private Double longitud;
    private Double precio;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private Integer plazasTotales;
    private Integer plazasDisponibles;
    private String imagenUrl;
    private Boolean activo;

    // Campo calculado: no existe en la BD, se calcula aquí
    private Integer plazasOcupadas;

    // ---- Constructor vacío (necesario para Jackson) ----
    public ViajeDTO() {}

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

    public Integer getPlazasOcupadas() { return plazasOcupadas; }
    public void setPlazasOcupadas(Integer plazasOcupadas) { this.plazasOcupadas = plazasOcupadas; }
}
