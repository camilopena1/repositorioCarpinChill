import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClimaService {

getClima(lat: number, lon: number): Observable<any> {
  return of({
    temperatura: 25,
    descripcion: 'Soleado',
    humedad: 50,
    viento: 10
  });
}
}
