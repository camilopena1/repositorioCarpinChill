import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface PerfilCliente {
  id?: number;
  telefono?: string;
  direccion?: string;
  dni?: string;
  fechaNacimiento?: string;
  imagenUrl?: string;
  notas?: string;
  paisCodigo?: string;
}

@Injectable({ providedIn: 'root' })
export class ClienteService {

  private apiUrl = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private get headers(): HttpHeaders {
    const token = this.authService.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  /**
   * Obtiene el perfil del cliente a partir de su usuarioId.
   * El endpoint devuelve 404 si aún no tiene perfil creado.
   */
  obtenerPerfilPorUsuario(usuarioId: number): Observable<PerfilCliente> {
    return this.http.get<PerfilCliente>(`${this.apiUrl}/usuario/${usuarioId}`, { headers: this.headers });
  }

  /**
   * Crea o actualiza el perfil del cliente (PUT idempotente).
   * Si no existe lo crea; si existe lo sobreescribe.
   */
  guardarPerfil(usuarioId: number, perfil: PerfilCliente): Observable<PerfilCliente> {
    return this.http.put<PerfilCliente>(`${this.apiUrl}/usuario/${usuarioId}`, perfil, { headers: this.headers });
  }
}
