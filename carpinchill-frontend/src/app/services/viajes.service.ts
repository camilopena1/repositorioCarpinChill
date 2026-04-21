import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Viaje } from '../models/viaje.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

/**
 * Servicio que conecta con la API REST del backend.
 *
 * Versión actualizada en entrega 3 (rama feature/panel-admin):
 *   - Añadido getTodosLosViajes() → GET /api/viajes/todos (para el admin)
 *   - Añadido desactivarViaje()  → PATCH /api/viajes/{id}/desactivar
 *   - Los métodos que requieren autenticación incluyen cabeceras HTTP Basic
 */
@Injectable({
  providedIn: 'root'
})
export class ViajesService {

  private apiUrl = `${environment.apiUrl}/viajes`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  // ── Método privado: genera cabeceras con autenticación Basic ─────────────
  // Spring Security acepta HTTP Basic para esta entrega.
  // En la siguiente entrega se sustituirá por Bearer Token (JWT).
  private authHeaders(): HttpHeaders {
    const usuario = this.authService.getUsuarioActual();
    if (!usuario) return new HttpHeaders();
    // Las credenciales se guardan en localStorage al hacer login
    const credenciales = btoa(`${usuario.username}:${usuario.password}`);
    return new HttpHeaders({ Authorization: `Basic ${credenciales}` });
  }

  // ---- GET /api/viajes → catálogo público ----
  getViajes(): Observable<Viaje[]> {
    return this.http.get<Viaje[]>(this.apiUrl);
  }

  // ---- GET /api/viajes/todos → todos incluyendo inactivos (admin) ----
  getTodosLosViajes(): Observable<Viaje[]> {
    return this.http.get<Viaje[]>(`${this.apiUrl}/todos`, {
      headers: this.authHeaders()
    });
  }

  // ---- GET /api/viajes/{id} ----
  getViajePorId(id: number): Observable<Viaje> {
    return this.http.get<Viaje>(`${this.apiUrl}/${id}`);
  }

  // ---- GET /api/viajes?pais=X ----
  getViajesPorPais(pais: string): Observable<Viaje[]> {
    const params = new HttpParams().set('pais', pais);
    return this.http.get<Viaje[]>(this.apiUrl, { params });
  }

  // ---- GET /api/viajes?precioMax=X ----
  getViajesPorPrecioMaximo(precioMax: number): Observable<Viaje[]> {
    const params = new HttpParams().set('precioMax', precioMax.toString());
    return this.http.get<Viaje[]>(this.apiUrl, { params });
  }

  // ---- POST /api/viajes ----
  crearViaje(viaje: Partial<Viaje>): Observable<Viaje> {
    return this.http.post<Viaje>(this.apiUrl, viaje, {
      headers: this.authHeaders()
    });
  }

  // ---- PUT /api/viajes/{id} ----
  actualizarViaje(id: number, viaje: Partial<Viaje>): Observable<Viaje> {
    return this.http.put<Viaje>(`${this.apiUrl}/${id}`, viaje, {
      headers: this.authHeaders()
    });
  }

  // ---- PATCH /api/viajes/{id}/desactivar ----
  desactivarViaje(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/desactivar`, {}, {
      headers: this.authHeaders()
    });
  }

  // ---- DELETE /api/viajes/{id} ----
  eliminarViaje(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.authHeaders()
    });
  }
}
