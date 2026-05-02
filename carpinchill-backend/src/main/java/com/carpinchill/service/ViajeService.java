package com.carpinchill.service;

import com.carpinchill.model.Viaje;
import com.carpinchill.repository.ViajeRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ViajeService {

    private final ViajeRepository viajeRepository;

    public ViajeService(ViajeRepository viajeRepository) {
        this.viajeRepository = viajeRepository;
    }

    public List<Viaje> obtenerTodos() {
        return viajeRepository.findAll();
    }

    public List<Viaje> obtenerActivos() {
        return viajeRepository.findAll().stream()
                .filter(Viaje::getActivo).collect(Collectors.toList());
    }

    public List<Viaje> buscarConFiltros(String pais, Double precioMin, Double precioMax,
                                         Integer plazasMin, String ordenar) {
        List<Viaje> viajes = obtenerActivos();

        if (pais != null && !pais.isBlank()) {
            viajes = viajes.stream()
                    .filter(v -> v.getPais().toLowerCase().contains(pais.toLowerCase()))
                    .collect(Collectors.toList());
        }
        if (precioMin != null) {
            viajes = viajes.stream().filter(v -> v.getPrecio() >= precioMin).collect(Collectors.toList());
        }
        if (precioMax != null) {
            viajes = viajes.stream().filter(v -> v.getPrecio() <= precioMax).collect(Collectors.toList());
        }
        if (plazasMin != null) {
            viajes = viajes.stream().filter(v -> v.getPlazasDisponibles() >= plazasMin).collect(Collectors.toList());
        }
        if (ordenar != null) {
            viajes = switch (ordenar) {
                case "precio_asc" -> viajes.stream().sorted(Comparator.comparing(Viaje::getPrecio)).collect(Collectors.toList());
                case "precio_desc" -> viajes.stream().sorted(Comparator.comparing(Viaje::getPrecio).reversed()).collect(Collectors.toList());
                case "plazas_asc" -> viajes.stream().sorted(Comparator.comparing(Viaje::getPlazasDisponibles)).collect(Collectors.toList());
                default -> viajes;
            };
        }

        return viajes;
    }

    public Viaje obtenerPorId(Long id) {
        return viajeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Viaje no encontrado con id: " + id));
    }

    public Viaje crear(Viaje viaje) {
        viaje.setActivo(true);
        if (viaje.getPlazasDisponibles() == null) viaje.setPlazasDisponibles(viaje.getPlazasTotales());
        return viajeRepository.save(viaje);
    }

    public Viaje actualizar(Long id, Viaje datos) {
        Viaje existente = obtenerPorId(id);
        existente.setTitulo(datos.getTitulo());
        existente.setDescripcion(datos.getDescripcion());
        existente.setDestino(datos.getDestino());
        existente.setPais(datos.getPais());
        existente.setLatitud(datos.getLatitud());
        existente.setLongitud(datos.getLongitud());
        existente.setPrecio(datos.getPrecio());
        existente.setFechaInicio(datos.getFechaInicio());
        existente.setFechaFin(datos.getFechaFin());
        existente.setPlazasTotales(datos.getPlazasTotales());
        existente.setImagenUrl(datos.getImagenUrl());
        if (datos.getActivo() != null) existente.setActivo(datos.getActivo());
        return viajeRepository.save(existente);
    }

    public void desactivar(Long id) {
        Viaje v = obtenerPorId(id);
        v.setActivo(false);
        viajeRepository.save(v);
    }

    public void eliminar(Long id) {
        obtenerPorId(id);
        viajeRepository.deleteById(id);
    }
}