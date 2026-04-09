import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, Usuario } from '../models/viaje.model';
import { environment } from '../../environments/environment';

/**
 * Servicio de autenticación.
 * Gestiona el login, logout y el estado del usuario en sesión.
 * Guarda los datos del usuario en localStorage para persistir entre recargas.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`;
  private readonly USER_KEY = 'carpinchill_usuario';

  constructor(private http: HttpClient) {}

  // ---- POST /api/auth/login ----
  login(credenciales: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credenciales).pipe(
      tap(respuesta => {
        if (respuesta.autenticado) {
          // Guarda el usuario en localStorage al hacer login correctamente
          const usuario: Usuario = {
            username: respuesta.username,
            rol: respuesta.rol,
            autenticado: true
          };
          localStorage.setItem(this.USER_KEY, JSON.stringify(usuario));
        }
      })
    );
  }

  // Cierra sesión borrando el localStorage
  logout(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  // Devuelve el usuario actual o null si no hay sesión
  getUsuarioActual(): Usuario | null {
    const datos = localStorage.getItem(this.USER_KEY);
    return datos ? JSON.parse(datos) : null;
  }

  // Comprueba si hay un usuario logueado
  estaAutenticado(): boolean {
    return this.getUsuarioActual() !== null;
  }

  // Comprueba si el usuario tiene rol ADMIN
  esAdmin(): boolean {
    const usuario = this.getUsuarioActual();
    return usuario?.rol === 'ROLE_ADMIN';
  }
}
