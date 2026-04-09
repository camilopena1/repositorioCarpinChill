// Modelo que representa un viaje.
// Tiene que coincidir exactamente con los campos que devuelve el backend de Brandon.

export interface Viaje {
  id: number;
  titulo: string;
  descripcion: string;
  destino: string;
  pais: string;
  latitud: number;
  longitud: number;
  precio: number;
  fechaInicio: string;   // Spring Boot serializa LocalDate como "2025-06-15"
  fechaFin: string;
  plazasTotales: number;
  plazasDisponibles: number;
  imagenUrl: string;
  activo: boolean;
}

// Modelo para el login
export interface LoginRequest {
  username: string;
  password: string;
}

// Lo que devuelve el backend al hacer login
export interface LoginResponse {
  mensaje: string;
  username: string;
  rol: string;
  autenticado: boolean;
}

// Info del usuario logueado (guardada en localStorage)
export interface Usuario {
  username: string;
  rol: string;
  autenticado: boolean;
}
