import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ViajesService } from '../../services/viajes.service';
import { Viaje } from '../../models/viaje.model';
import { SplashComponent } from '../splash/splash.component';

@Component({
  selector: 'app-lista-viajes',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SplashComponent],
  template: `
    <!-- Splash solo la primera vez por sesión -->
    <app-splash *ngIf="mostrarSplash" (done)="mostrarSplash = false"></app-splash>

    <div class="pagina-viajes">

      <!-- Cabecera -->
      <div class="cabecera">
        <h1>🌍 Nuestros viajes</h1>
        <p>Descubre los mejores destinos al mejor precio</p>
      </div>

      <!-- Filtros -->
      <div class="filtros">
        <div class="filtro-grupo">
          <label>País</label>
          <input type="text" [(ngModel)]="filtroPais" placeholder="Ej: Francia" (input)="filtrar()" />
        </div>
        <div class="filtro-grupo">
          <label>Precio máximo (€)</label>
          <input type="number" [(ngModel)]="filtroPrecio" placeholder="Ej: 1000" (input)="filtrar()" />
        </div>
        <button class="btn-limpiar" (click)="limpiarFiltros()">✕ Limpiar</button>
      </div>

      <!-- Estado de carga -->
      <div *ngIf="cargando" class="estado-carga">
        <div class="spinner"></div>
        <p>Cargando viajes...</p>
      </div>

      <!-- Error de conexión -->
      <div *ngIf="error" class="estado-error">
        <p>⚠️ No se pudo conectar con el servidor.</p>
        <p class="error-detalle">Asegúrate de que el backend está corriendo en localhost:8080</p>
        <button (click)="cargarViajes()" class="btn-reintentar">Reintentar</button>
      </div>

      <!-- Sin resultados -->
      <div *ngIf="!cargando && !error && viajesFiltrados.length === 0" class="sin-resultados">
        <p>No se encontraron viajes con los filtros aplicados.</p>
      </div>

      <!-- Grid de tarjetas -->
      <div *ngIf="!cargando && !error" class="grid-viajes">
        <div *ngFor="let viaje of viajesFiltrados" class="tarjeta-viaje">
          <div class="tarjeta-imagen">
            <img
              [src]="viaje.imagenUrl || 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400'"
              [alt]="viaje.titulo"
              (error)="onImageError($event)"
            />
            <span class="badge-pais">{{ viaje.pais }}</span>
          </div>
          <div class="tarjeta-contenido">
            <h3>{{ viaje.titulo }}</h3>
            <p class="destino">📍 {{ viaje.destino }}, {{ viaje.pais }}</p>
            <p class="descripcion">{{ viaje.descripcion }}</p>
            <div class="tarjeta-fechas" *ngIf="viaje.fechaInicio">
              <span>📅 {{ viaje.fechaInicio | date:'dd/MM/yyyy' }}</span>
              <span> → {{ viaje.fechaFin | date:'dd/MM/yyyy' }}</span>
            </div>
            <div class="tarjeta-pie">
              <div class="precio-plazas">
                <span class="precio">{{ viaje.precio | currency:'EUR':'symbol':'1.0-0' }}</span>
                <span class="plazas" [class.pocas-plazas]="viaje.plazasDisponibles <= 5">
                  {{ viaje.plazasDisponibles }} plazas
                </span>
              </div>
              <a [routerLink]="['/viajes', viaje.id]" class="btn-ver">Ver detalles →</a>
            </div>
          </div>
        </div>
      </div>

      <p *ngIf="!cargando && !error && viajesFiltrados.length > 0" class="contador">
        Mostrando {{ viajesFiltrados.length }} de {{ viajes.length }} viajes
      </p>

    </div>
  `,
  styles: [`
    .pagina-viajes { padding: 16px 0; }
    .cabecera { text-align: center; margin-bottom: 32px; }
    .cabecera h1 { font-size: 32px; color: #1B4F72; margin: 0 0 8px; }
    .cabecera p { color: #666; font-size: 16px; }
    .filtros { display: flex; gap: 16px; align-items: flex-end; margin-bottom: 28px; flex-wrap: wrap; background: #f8f9fa; padding: 16px; border-radius: 12px; }
    .filtro-grupo { display: flex; flex-direction: column; gap: 4px; }
    .filtro-grupo label { font-size: 13px; font-weight: 600; color: #555; }
    .filtro-grupo input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; width: 180px; }
    .btn-limpiar { padding: 8px 16px; background: transparent; border: 1px solid #ccc; border-radius: 8px; cursor: pointer; color: #666; font-size: 13px; }
    .btn-limpiar:hover { background: #eee; }
    .grid-viajes { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
    .tarjeta-viaje { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); transition: transform 0.2s, box-shadow 0.2s; }
    .tarjeta-viaje:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
    .tarjeta-imagen { position: relative; height: 200px; overflow: hidden; }
    .tarjeta-imagen img { width: 100%; height: 100%; object-fit: cover; }
    .badge-pais { position: absolute; top: 12px; right: 12px; background: rgba(27,79,114,0.85); color: white; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .tarjeta-contenido { padding: 16px; }
    .tarjeta-contenido h3 { margin: 0 0 6px; font-size: 18px; color: #1B4F72; }
    .destino { color: #666; font-size: 13px; margin: 0 0 8px; }
    .descripcion { color: #444; font-size: 14px; line-height: 1.5; margin: 0 0 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .tarjeta-fechas { font-size: 13px; color: #555; margin-bottom: 12px; }
    .tarjeta-pie { display: flex; align-items: center; justify-content: space-between; padding-top: 12px; border-top: 1px solid #eee; }
    .precio-plazas { display: flex; flex-direction: column; gap: 2px; }
    .precio { font-size: 22px; font-weight: bold; color: #1B4F72; }
    .plazas { font-size: 12px; color: #4CAF50; }
    .pocas-plazas { color: #e74c3c; font-weight: 600; }
    .btn-ver { background: #1B4F72; color: white; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-size: 14px; transition: background 0.2s; }
    .btn-ver:hover { background: #154360; }
    .estado-carga { text-align: center; padding: 60px; color: #666; }
    .spinner { width: 40px; height: 40px; border: 4px solid #f0f0f0; border-top-color: #1B4F72; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .estado-error { text-align: center; padding: 40px; background: #fef3f3; border-radius: 12px; color: #c0392b; }
    .error-detalle { font-size: 13px; color: #888; }
    .btn-reintentar { margin-top: 12px; padding: 8px 20px; background: #1B4F72; color: white; border: none; border-radius: 8px; cursor: pointer; }
    .sin-resultados { text-align: center; padding: 60px; color: #888; font-size: 16px; }
    .contador { text-align: center; margin-top: 24px; color: #888; font-size: 13px; }
  `]
})
export class ListaViajesComponent implements OnInit {

  viajes: Viaje[] = [];
  viajesFiltrados: Viaje[] = [];
  cargando = true;
  error = false;
  filtroPais = '';
  filtroPrecio: number | null = null;

  // Splash: solo la primera vez por sesión
  mostrarSplash = !sessionStorage.getItem('splash_visto');

  constructor(private viajesService: ViajesService) {}

  ngOnInit(): void {
    // Marcar como visto para que no salga de nuevo en esta sesión
    sessionStorage.setItem('splash_visto', '1');
    this.cargarViajes();
  }

  cargarViajes(): void {
    this.cargando = true;
    this.error = false;
    this.viajesService.getViajes().subscribe({
      next: (viajes) => { this.viajes = viajes; this.viajesFiltrados = viajes; this.cargando = false; },
      error: (err) => { console.error('Error al cargar viajes:', err); this.error = true; this.cargando = false; }
    });
  }

  filtrar(): void {
    this.viajesFiltrados = this.viajes.filter(v => {
      const coincidePais = !this.filtroPais || v.pais.toLowerCase().includes(this.filtroPais.toLowerCase());
      const coincidePrecio = !this.filtroPrecio || v.precio <= this.filtroPrecio;
      return coincidePais && coincidePrecio;
    });
  }

  limpiarFiltros(): void {
    this.filtroPais = '';
    this.filtroPrecio = null;
    this.viajesFiltrados = this.viajes;
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400';
  }
}