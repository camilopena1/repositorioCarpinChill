import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface ReservaRequest {
  viajeId: number;
  numPersonas: number;
  notas?: string;
}

export interface ReservaResponse {
  id: number;
  usuarioId: number;
  nombreUsuario: string;
  viajeId: number;
  tituloViaje: string;
  fechaReserva: string;
  numPersonas: number;
  precioTotal: number;
  estado: string;
  notas?: string;
}

@Injectable({ providedIn: 'root' })
export class ReservaService {

  private apiUrl = `${environment.apiUrl}/reservas`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private get headers(): HttpHeaders {
    const token = this.authService.getToken();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  crearReserva(reserva: ReservaRequest): Observable<ReservaResponse> {
    return this.http.post<ReservaResponse>(this.apiUrl, reserva, { headers: this.headers });
  }

  getMisReservas(): Observable<ReservaResponse[]> {
    return this.http.get<ReservaResponse[]>(`${this.apiUrl}/mis-reservas`, { headers: this.headers });
  }

  getTodasLasReservas(): Observable<ReservaResponse[]> {
    return this.http.get<ReservaResponse[]>(this.apiUrl, { headers: this.headers });
  }

  confirmarReserva(id: number): Observable<ReservaResponse> {
    return this.http.patch<ReservaResponse>(`${this.apiUrl}/${id}/confirmar`, {}, { headers: this.headers });
  }

  cancelarReserva(id: number): Observable<ReservaResponse> {
    return this.http.patch<ReservaResponse>(`${this.apiUrl}/${id}/cancelar`, {}, { headers: this.headers });
  }
}