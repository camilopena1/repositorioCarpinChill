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
  plazasOcupadas?: number;
  valoracionMedia?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegistroRequest {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  nombre: string;
  rol: string;
  usuarioId: number;
}

export interface Usuario {
  email: string;
  nombre: string;
  rol: string;
  usuarioId: number;
  autenticado: boolean;
}
