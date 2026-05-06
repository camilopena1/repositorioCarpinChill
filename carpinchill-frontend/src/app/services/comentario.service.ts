import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Comentario {
  id?: number;
  comentario: string;
  valoracion: number;
  fechaComentario?: string;
  usuario?: { nombre: string; apellidos: string; email: string };
}

export interface MediaResponse {
  viajeId: number;
  media: number;
}

@Injectable({ providedIn: 'root' })
export class ComentarioService {

  private apiUrl = `${environment.apiUrl}/comentarios`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private get headers(): HttpHeaders {
    const token = this.authService.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  getComentariosPorViaje(viajeId: number): Observable<Comentario[]> {
    return this.http.get<Comentario[]>(`${this.apiUrl}/viaje/${viajeId}`);
  }

  getMediaViaje(viajeId: number): Observable<MediaResponse> {
    return this.http.get<MediaResponse>(`${this.apiUrl}/viaje/${viajeId}/media`);
  }

  crearComentario(viajeId: number, valoracion: number, comentario: string): Observable<Comentario> {
    return this.http.post<Comentario>(
      `${this.apiUrl}/viaje/${viajeId}`,
      { valoracion, comentario },
      { headers: this.headers }
    );
  }

  eliminarComentario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.headers });
  }
}
