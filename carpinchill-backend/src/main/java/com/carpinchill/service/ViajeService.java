package com.carpinchill.service;

import com.carpinchill.model.Viaje;
import com.carpinchill.repository.ComentarioRepository;
import com.carpinchill.repository.ReservaRepository;
import com.carpinchill.repository.ViajeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ViajeService {

    private final ViajeRepository viajeRepository;
    private final ComentarioRepository comentarioRepository;
    private final ReservaRepository reservaRepository;

    public ViajeService(ViajeRepository viajeRepository, ComentarioRepository comentarioRepository,
                        ReservaRepository reservaRepository) {
        this.viajeRepository = viajeRepository;
        this.comentarioRepository = comentarioRepository;
        this.reservaRepository = reservaRepository;
    }

    public List<Viaje> obtenerTodos() {
        return viajeRepository.findAll();
    }

    public List<Viaje> obtenerActivos() {
        return viajeRepository.findAll().stream()
                .filter(Viaje::getActivo).collect(Collectors.toList());
    }

    /**
     * Busca viajes activos aplicando todos los filtros disponibles.
     *
     * @param pais            Busqueda parcial por nombre de pais (insensible a mayusculas)
     * @param precioMin       Precio minimo por persona (inclusive)
     * @param precioMax       Precio maximo por persona (inclusive)
     * @param plazasMin       Minimo de plazas disponibles requeridas
     * @param valoracionMin   Valoracion media minima (1.0 - 5.0). Viajes sin valoraciones se excluyen si se activa este filtro.
     * @param fechaSalidaDesde Solo muestra viajes cuya fechaInicio sea igual o posterior a esta fecha
     * @param ordenar         precio_asc | precio_desc | plazas_asc | valoracion_desc
     */
    public List<Viaje> buscarConFiltros(String pais, Double precioMin, Double precioMax,
                                         Integer plazasMin, Double valoracionMin,
                                         LocalDate fechaSalidaDesde, String ordenar) {
        List<Viaje> viajes = obtenerActivos();

        if (pais != null && !pais.isBlank()) {
            viajes = viajes.stream()
                    .filter(v -> v.getPais().toLowerCase().contains(pais.toLowerCase()))
                    .collect(Collectors.toList());
        }
        if (precioMin != null) {
            viajes = viajes.stream()
                    .filter(v -> v.getPrecio() >= precioMin)
                    .collect(Collectors.toList());
        }
        if (precioMax != null) {
            viajes = viajes.stream()
                    .filter(v -> v.getPrecio() <= precioMax)
                    .collect(Collectors.toList());
        }
        if (plazasMin != null) {
            viajes = viajes.stream()
                    .filter(v -> v.getPlazasDisponibles() >= plazasMin)
                    .collect(Collectors.toList());
        }
        // Filtro por valoracion media minima: consultamos la media de cada viaje en la BD
        if (valoracionMin != null) {
            viajes = viajes.stream()
                    .filter(v -> {
                        Double media = comentarioRepository.calcularMediaPorViaje(v.getId());
                        // Si el viaje no tiene comentarios (media == null) lo excluimos
                        return media != null && media >= valoracionMin;
                    })
                    .collect(Collectors.toList());
        }
        // Filtro por fecha de salida: solo viajes que salgan en esa fecha o posterior
        if (fechaSalidaDesde != null) {
            viajes = viajes.stream()
                    .filter(v -> v.getFechaInicio() != null && !v.getFechaInicio().isBefore(fechaSalidaDesde))
                    .collect(Collectors.toList());
        }

        if (ordenar != null) {
            viajes = switch (ordenar) {
                case "precio_asc" -> viajes.stream()
                        .sorted(Comparator.comparing(Viaje::getPrecio))
                        .collect(Collectors.toList());
                case "precio_desc" -> viajes.stream()
                        .sorted(Comparator.comparing(Viaje::getPrecio).reversed())
                        .collect(Collectors.toList());
                case "plazas_asc" -> viajes.stream()
                        .sorted(Comparator.comparing(Viaje::getPlazasDisponibles))
                        .collect(Collectors.toList());
                // Ordena por valoracion media de mayor a menor; los viajes sin valoraciones van al final
                case "valoracion_desc" -> viajes.stream()
                        .sorted(Comparator.comparingDouble((Viaje v) -> {
                            Double media = comentarioRepository.calcularMediaPorViaje(v.getId());
                            return media != null ? media : 0.0;
                        }).reversed())
                        .collect(Collectors.toList());
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

    @Transactional
    public void eliminar(Long id) {
        obtenerPorId(id);
        // Borrar primero los registros dependientes para evitar errores de foreign key
        comentarioRepository.deleteByViajeId(id);
        reservaRepository.deleteByViajeId(id);
        viajeRepository.deleteById(id);
    }
}