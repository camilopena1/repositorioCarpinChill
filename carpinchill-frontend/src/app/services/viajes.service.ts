import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Viaje } from '../models/viaje.model';
import { environment } from '../../environments/environment';

/**
 * Servicio que conecta con la API REST del backend de Brandon.
 * Todos los componentes que necesiten datos de viajes usan este servicio.
 *
 * Endpoints que consume:
 *   GET  /api/viajes              → lista viajes activos
 *   GET  /api/viajes/{id}         → detalle de un viaje
 *   GET  /api/viajes?pais=X       → filtra por país
 *   GET  /api/viajes?precioMax=X  → filtra por precio
 *   POST /api/viajes              → crea viaje (admin)
 *   PUT  /api/viajes/{id}         → edita viaje (admin)
 *   DELETE /api/viajes/{id}       → elimina viaje (admin)
 */
@Injectable({
  providedIn: 'root'
})
export class ViajesService {

  private apiUrl = `${environment.apiUrl}/viajes`;

  // Angular inyecta HttpClient automáticamente
  constructor(private http: HttpClient) {}

  // ---- GET /api/viajes ----
  getViajes(): Observable<Viaje[]> {
    return this.http.get<Viaje[]>(this.apiUrl);
  }

  // ---- GET /api/viajes/{id} ----
  getViajePorId(id: number): Observable<Viaje> {
    return this.http.get<Viaje>(`${this.apiUrl}/${id}`);
  }

  // ---- GET /api/viajes?pais=Francia ----
  getViajesPorPais(pais: string): Observable<Viaje[]> {
    const params = new HttpParams().set('pais', pais);
    return this.http.get<Viaje[]>(this.apiUrl, { params });
  }

  // ---- GET /api/viajes?precioMax=1000 ----
  getViajesPorPrecioMaximo(precioMax: number): Observable<Viaje[]> {
    const params = new HttpParams().set('precioMax', precioMax.toString());
    return this.http.get<Viaje[]>(this.apiUrl, { params });
  }

  // ---- POST /api/viajes ---- (solo admin)
  crearViaje(viaje: Partial<Viaje>): Observable<Viaje> {
    return this.http.post<Viaje>(this.apiUrl, viaje);
  }

  // ---- PUT /api/viajes/{id} ---- (solo admin)
  actualizarViaje(id: number, viaje: Partial<Viaje>): Observable<Viaje> {
    return this.http.put<Viaje>(`${this.apiUrl}/${id}`, viaje);
  }

  // ---- DELETE /api/viajes/{id} ---- (solo admin)
  eliminarViaje(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
