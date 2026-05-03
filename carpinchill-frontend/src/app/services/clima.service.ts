import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClimaService {

  private apiUrl = `${environment.apiUrl}/clima`;

  constructor(private http: HttpClient) {}

  getClima(lat: number, lon: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?lat=${lat}&lon=${lon}`);
  }
}