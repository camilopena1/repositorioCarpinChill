import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, Usuario } from '../models/viaje.model';
import { environment } from '../../environments/environment';

/**
 * Servicio de autenticación.
 *
 * Actualizado en entrega 3 (rama feature/panel-admin):
 *   - Al hacer login se guarda también la contraseña en localStorage
 *     para poder enviarla en las cabeceras HTTP Basic de las peticiones
 *     protegidas (crear, editar, eliminar viajes).
 *   - En la siguiente entrega se sustituirá por JWT Bearer Token.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`;
  private readonly USER_KEY = 'carpinchill_usuario';

  constructor(private http: HttpClient) {}

  login(credenciales: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credenciales).pipe(
      tap(respuesta => {
        if (respuesta.autenticado) {
          const usuario: Usuario = {
            username: respuesta.username,
            // Guardamos la contraseña para HTTP Basic en esta entrega
            // TODO: sustituir por JWT en la siguiente entrega
            password: credenciales.password,
            rol: respuesta.rol,
            autenticado: true
          };
          localStorage.setItem(this.USER_KEY, JSON.stringify(usuario));
        }
      })
    );
  }
  registro(data: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/register`, data);
}

  logout(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  getUsuarioActual(): Usuario | null {
    const datos = localStorage.getItem(this.USER_KEY);
    return datos ? JSON.parse(datos) : null;
  }

  estaAutenticado(): boolean {
    return this.getUsuarioActual() !== null;
  }

  esAdmin(): boolean {
    const usuario = this.getUsuarioActual();
    return usuario?.rol === 'ROLE_ADMIN';
  }

  esAdminOAgente(): boolean {
    const usuario = this.getUsuarioActual();
    return usuario?.rol === 'ROLE_ADMIN' || usuario?.rol === 'ROLE_AGENTE';
  }
}
