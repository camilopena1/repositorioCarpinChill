import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegistroRequest, Usuario } from '../models/viaje.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`;
  private readonly USER_KEY = 'carpinchill_usuario';
  private readonly TOKEN_KEY = 'carpinchill_token';

  constructor(private http: HttpClient) {}

  login(credenciales: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credenciales).pipe(
      tap(r => this.guardarSesion(r))
    );
  }

  registro(datos: RegistroRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/registro`, datos).pipe(
      tap(r => this.guardarSesion(r))
    );
  }

  private guardarSesion(r: AuthResponse): void {
    const usuario: Usuario = {
      email: r.email,
      nombre: r.nombre,
      rol: r.rol,
      usuarioId: r.usuarioId,
      autenticado: true
    };
    localStorage.setItem(this.USER_KEY, JSON.stringify(usuario));
    localStorage.setItem(this.TOKEN_KEY, r.token);
  }

  logout(): void {
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
  }

  getUsuarioActual(): Usuario | null {
    const d = localStorage.getItem(this.USER_KEY);
    return d ? JSON.parse(d) : null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  estaAutenticado(): boolean {
    return !!this.getToken() && !!this.getUsuarioActual();
  }

  esAdmin(): boolean {
    return this.getUsuarioActual()?.rol === 'ROLE_ADMIN';
  }

  esAdminOAgente(): boolean {
    const rol = this.getUsuarioActual()?.rol;
    return rol === 'ROLE_ADMIN' || rol === 'ROLE_AGENTE';
  }

  getUsuarioId(): number | null {
    return this.getUsuarioActual()?.usuarioId ?? null;
  }
}
