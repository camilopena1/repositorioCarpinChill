// Modelo que representa un viaje (coincide con ViajeDTO del backend)
export interface Viaje {
  id?: number;
  titulo: string;
  descripcion: string;
  destino: string;
  pais: string;
  latitud: number;
  longitud: number;
  precio: number;
  fechaInicio: string;
  fechaFin: string;
  plazasTotales: number;
  plazasDisponibles: number;
  imagenUrl: string;
  activo: boolean;
  // Campo calculado que devuelve el backend en el DTO
  plazasOcupadas?: number;
}

// Petición de login
export interface LoginRequest {
  username: string;
  password: string;
}

// Respuesta del backend al hacer login
export interface LoginResponse {
  mensaje: string;
  username: string;
  rol: string;
  autenticado: boolean;
}

// Usuario en sesión (guardado en localStorage)
export interface Usuario {
  username: string;
  password?: string; // Guardado para HTTP Basic — se elimina al implementar JWT
  rol: string;
  autenticado: boolean;
}
