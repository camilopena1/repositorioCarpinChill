package com.carpinchill.service;

import com.carpinchill.model.Viaje;
import com.carpinchill.repository.ViajeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Capa de servicio para Viaje.
 * Aquí va la lógica de negocio (validaciones, reglas, etc.).
 * El controller nunca toca el repositorio directamente.
 */
@Service
public class ViajeService {

    private final ViajeRepository viajeRepository;

    // Inyección de dependencias por constructor (recomendado sobre @Autowired)
    public ViajeService(ViajeRepository viajeRepository) {
        this.viajeRepository = viajeRepository;
    }

    /**
     * Devuelve todos los viajes (activos e inactivos).
     * Solo el admin debería usar este método.
     */
    public List<Viaje> obtenerTodos() {
        return viajeRepository.findAll();
    }

    /**
     * Devuelve solo viajes activos (para el catálogo público).
     */
    public List<Viaje> obtenerActivos() {
        return viajeRepository.findByActivoTrue();
    }

    /**
     * Busca un viaje por su ID.
     * Lanza excepción si no existe.
     */
    public Viaje obtenerPorId(Long id) {
        return viajeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Viaje no encontrado con id: " + id));
    }

    /**
     * Crea un nuevo viaje y lo guarda en BD.
     */
    public Viaje crear(Viaje viaje) {
        viaje.setActivo(true); // siempre activo al crear
        return viajeRepository.save(viaje);
    }

    /**
     * Actualiza un viaje existente.
     * Busca el viaje, actualiza sus campos y guarda.
     */
    public Viaje actualizar(Long id, Viaje datosNuevos) {
        Viaje viaje = obtenerPorId(id); // lanza excepción si no existe

        viaje.setTitulo(datosNuevos.getTitulo());
        viaje.setDescripcion(datosNuevos.getDescripcion());
        viaje.setDestino(datosNuevos.getDestino());
        viaje.setPais(datosNuevos.getPais());
        viaje.setLatitud(datosNuevos.getLatitud());
        viaje.setLongitud(datosNuevos.getLongitud());
        viaje.setPrecio(datosNuevos.getPrecio());
        viaje.setFechaInicio(datosNuevos.getFechaInicio());
        viaje.setFechaFin(datosNuevos.getFechaFin());
        viaje.setPlazasTotales(datosNuevos.getPlazasTotales());
        viaje.setPlazasDisponibles(datosNuevos.getPlazasDisponibles());
        viaje.setImagenUrl(datosNuevos.getImagenUrl());

        return viajeRepository.save(viaje);
    }

    /**
     * Baja lógica: marca el viaje como inactivo (no lo borra de BD).
     * Esto es mejor práctica que borrar físicamente.
     */
    public void desactivar(Long id) {
        Viaje viaje = obtenerPorId(id);
        viaje.setActivo(false);
        viajeRepository.save(viaje);
    }

    /**
     * Baja física: elimina el viaje de la BD.
     * Usar con cuidado.
     */
    public void eliminar(Long id) {
        if (!viajeRepository.existsById(id)) {
            throw new RuntimeException("Viaje no encontrado con id: " + id);
        }
        viajeRepository.deleteById(id);
    }

    /**
     * Filtra viajes por país.
     */
    public List<Viaje> buscarPorPais(String pais) {
        return viajeRepository.findByPaisContainingIgnoreCase(pais);
    }

    /**
     * Filtra viajes por precio máximo.
     */
    public List<Viaje> buscarPorPrecioMaximo(Double precioMax) {
        return viajeRepository.findByPrecioLessThanEqual(precioMax);
    }
}
