import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface ReservaResponse {
  id: number;
  estado: string;
  fechaReserva: string;
  tituloViaje: string;
  numPersonas: number;
  precioTotal: number;
  notas?: string;
  viajeId: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReservaService {

  getMisReservas(): Observable<ReservaResponse[]> {
  return of([
    {
      id: 1,
      estado: 'CONFIRMADA',
      fechaReserva: new Date().toISOString(),
      tituloViaje: 'Viaje a París',
      numPersonas: 2,
      precioTotal: 500,
      notas: 'Asiento ventana',
      viajeId: 1
    }
  ]);
}

  crearReserva(data: any): Observable<any> {
    console.log('Reserva creada:', data);
    return of({ ok: true });
  }

  cancelarReserva(id: number): Observable<any> {
    console.log('Reserva cancelada:', id);
    return of({ ok: true });
  }
}