import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Viaje } from '../models/viaje.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ViajesService {

  private apiUrl = `${environment.apiUrl}/viajes`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private get headers(): HttpHeaders {
    const token = this.authService.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  getViajes(filtros?: {pais?: string, precioMin?: number, precioMax?: number, plazasMin?: number, ordenar?: string}): Observable<Viaje[]> {
    let params = new HttpParams();
    if (filtros?.pais) params = params.set('pais', filtros.pais);
    if (filtros?.precioMin) params = params.set('precioMin', filtros.precioMin.toString());
    if (filtros?.precioMax) params = params.set('precioMax', filtros.precioMax.toString());
    if (filtros?.plazasMin) params = params.set('plazasMin', filtros.plazasMin.toString());
    if (filtros?.ordenar) params = params.set('ordenar', filtros.ordenar);
    return this.http.get<Viaje[]>(this.apiUrl, { params });
  }

  getTodosLosViajes(): Observable<Viaje[]> {
    return this.http.get<Viaje[]>(`${this.apiUrl}/todos`, { headers: this.headers });
  }

  getViajePorId(id: number): Observable<Viaje> {
    return this.http.get<Viaje>(`${this.apiUrl}/${id}`);
  }

  crearViaje(viaje: Partial<Viaje>): Observable<Viaje> {
    return this.http.post<Viaje>(this.apiUrl, viaje, { headers: this.headers });
  }

  actualizarViaje(id: number, viaje: Partial<Viaje>): Observable<Viaje> {
    return this.http.put<Viaje>(`${this.apiUrl}/${id}`, viaje, { headers: this.headers });
  }

  desactivarViaje(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/desactivar`, {}, { headers: this.headers });
  }

  eliminarViaje(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.headers });
  }
}
