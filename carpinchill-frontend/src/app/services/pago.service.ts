import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface PagoRequest {
  reservaId: number;
  numeroTarjeta: string;
  nombreTitular: string;
  fechaExpiracion: string;
  cvv: string;
}

export interface PagoResponse {
  exito: boolean;
  mensaje: string;
  pago: {
    id: number;
    importe: number;
    estado: string;
    fechaPago: string;
    ultimosDigitos: string;
    nombreTitular: string;
  };
}

@Injectable({ providedIn: 'root' })
export class PagoService {

  private apiUrl = `${environment.apiUrl}/pagos`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private get headers(): HttpHeaders {
    const token = this.authService.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  procesarPago(datos: PagoRequest): Observable<PagoResponse> {
    return this.http.post<PagoResponse>(`${this.apiUrl}/procesar`, datos, { headers: this.headers });
  }
}
