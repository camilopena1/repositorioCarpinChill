import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ClienteService {

  private apiUrl = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private get headers() {
    const token = this.authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  getClientes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.headers });
  }

  buscar(q: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/buscar?q=${q}`, { headers: this.headers });
  }

  crearOActualizar(usuarioId: number, datos: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/usuario/${usuarioId}`, datos, { headers: this.headers });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.headers });
  }
}
