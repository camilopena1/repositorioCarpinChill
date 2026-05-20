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
    <app-splash *ngIf="mostrarSplash" [modoOscuro]="modoOscuro" (done)="mostrarSplash = false"></app-splash>

    <div class="pagina-viajes">

      <div class="cabecera">
        <h1>🌍 Nuestros viajes</h1>
        <p>Descubre los mejores destinos al mejor precio</p>
      </div>

      <!-- Panel de filtros -->
      <div class="filtros">
        <div class="filtro-grupo">
          <label>País</label>
          <input type="text" [(ngModel)]="filtroPais" placeholder="Ej: Francia" (input)="aplicarFiltros()" />
        </div>
        <div class="filtro-grupo">
          <label>Precio mín. (€)</label>
          <input type="number" [(ngModel)]="filtroPrecioMin" placeholder="0" min="0" (input)="aplicarFiltros()" />
        </div>
        <div class="filtro-grupo">
          <label>Precio máx. (€)</label>
          <input type="number" [(ngModel)]="filtroPrecioMax" placeholder="Ej: 1000" min="0" (input)="aplicarFiltros()" />
        </div>
        <div class="filtro-grupo">
          <label>Plazas mín.</label>
          <input type="number" [(ngModel)]="filtroPlazasMin" placeholder="Ej: 5" min="1" (input)="aplicarFiltros()" />
        </div>
        <div class="filtro-grupo">
          <label>Valoración mín. ⭐</label>
          <select [(ngModel)]="filtroValoracionMin" (change)="aplicarFiltros()">
            <option [ngValue]="null">Todas</option>
            <option [ngValue]="4">4+ estrellas</option>
            <option [ngValue]="3">3+ estrellas</option>
            <option [ngValue]="2">2+ estrellas</option>
          </select>
        </div>
        <div class="filtro-grupo">
          <label>Salida desde</label>
          <input type="date" [(ngModel)]="filtroFechaSalida" (change)="aplicarFiltros()" />
        </div>
        <div class="filtro-grupo">
          <label>Ordenar por</label>
          <select [(ngModel)]="filtroOrden" (change)="aplicarFiltros()">
            <option value="">Por defecto</option>
            <option value="precio_asc">Precio: menor a mayor</option>
            <option value="precio_desc">Precio: mayor a menor</option>
            <option value="plazas_asc">Menos plazas primero</option>
            <option value="valoracion_desc">Mejor valorados</option>
          </select>
        </div>
        <button class="btn-limpiar" (click)="limpiarFiltros()">✕ Limpiar</button>
      </div>

      <!-- Carga -->
      <div *ngIf="cargando" class="estado-carga">
        <div class="spinner"></div>
        <p>Cargando viajes...</p>
      </div>

      <!-- Error -->
      <div *ngIf="error" class="estado-error">
        <p>⚠️ No se pudo conectar con el servidor.</p>
        <button (click)="cargarViajes()" class="btn-reintentar">Reintentar</button>
      </div>

      <!-- Sin resultados -->
      <div *ngIf="!cargando && !error && viajes.length === 0" class="sin-resultados">
        <p>🔍 No se encontraron viajes con los filtros aplicados.</p>
        <button class="btn-limpiar" (click)="limpiarFiltros()">Quitar filtros</button>
      </div>

      <!-- Grid de tarjetas -->
      <div *ngIf="!cargando && !error && viajes.length > 0" class="grid-viajes">
        <div *ngFor="let viaje of viajes" class="tarjeta-viaje">
          <div class="tarjeta-imagen">
            <img
              [src]="viaje.imagenUrl || 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400'"
              [alt]="viaje.titulo"
              (error)="onImageError($event)"
            />
            <span class="badge-pais">{{ viaje.pais }}</span>
            <!-- Badge de valoración sobre la imagen -->
            <span class="badge-valoracion" *ngIf="viaje.valoracionMedia">
              ⭐ {{ viaje.valoracionMedia | number:'1.1-1' }}
            </span>
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

      <p *ngIf="!cargando && !error && viajes.length > 0" class="contador">
        Mostrando {{ viajes.length }} viaje{{ viajes.length !== 1 ? 's' : '' }}
      </p>

    </div>
  `,
  styles: [`
    .pagina-viajes { padding: 16px 0; }
    .cabecera { text-align: center; margin-bottom: 32px; }
    .cabecera h1 { font-size: 32px; color: #1B4F72; margin: 0 0 8px; }
    .cabecera p { color: var(--text-muted, #666); font-size: 16px; }

    .filtros {
      display: flex; gap: 12px; align-items: flex-end; margin-bottom: 28px;
      flex-wrap: wrap; background: var(--bg-muted, #f8f9fa); padding: 16px; border-radius: 12px;
    }
    .filtro-grupo { display: flex; flex-direction: column; gap: 4px; }
    .filtro-grupo label { font-size: 12px; font-weight: 600; color: var(--text-label, #555); }
    .filtro-grupo input, .filtro-grupo select {
      padding: 8px 10px; border: 1px solid #ddd; border-radius: 8px;
      font-size: 13px; width: 150px; background: var(--bg-input, white);
    }
    .filtro-grupo input[type="date"] { width: 155px; }
    .btn-limpiar {
      padding: 8px 16px; background: transparent; border: 1px solid #ccc;
      border-radius: 8px; cursor: pointer; color: var(--text-muted, #666); font-size: 13px;
      white-space: nowrap;
    }
    .btn-limpiar:hover { background: #eee; }

    .grid-viajes { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
    .tarjeta-viaje {
      background: var(--bg-card, white); border-radius: 16px; overflow: hidden;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08); transition: transform 0.2s, box-shadow 0.2s;
    }
    .tarjeta-viaje:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
    .tarjeta-imagen { position: relative; height: 200px; overflow: hidden; }
    .tarjeta-imagen img { width: 100%; height: 100%; object-fit: cover; }
    .badge-pais {
      position: absolute; top: 12px; right: 12px;
      background: rgba(27,79,114,0.85); color: white;
      padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;
    }
    .badge-valoracion {
      position: absolute; bottom: 12px; left: 12px;
      background: rgba(0,0,0,0.65); color: #FFD700;
      padding: 3px 8px; border-radius: 12px; font-size: 13px; font-weight: 700;
    }
    .tarjeta-contenido { padding: 16px; }
    .tarjeta-contenido h3 { margin: 0 0 6px; font-size: 18px; color: #1B4F72; }
    .destino { color: var(--text-muted, #666); font-size: 13px; margin: 0 0 8px; }
    .descripcion {
      color: var(--text-primary, #444); font-size: 14px; line-height: 1.5; margin: 0 0 12px;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .tarjeta-fechas { font-size: 13px; color: var(--text-muted, #555); margin-bottom: 12px; }
    .tarjeta-pie {
      display: flex; align-items: center; justify-content: space-between;
      padding-top: 12px; border-top: 1px solid #eee;
    }
    .precio-plazas { display: flex; flex-direction: column; gap: 2px; }
    .precio { font-size: 22px; font-weight: bold; color: #1B4F72; }
    .plazas { font-size: 12px; color: #4CAF50; }
    .pocas-plazas { color: #e74c3c; font-weight: 600; }
    .btn-ver {
      background: #1B4F72; color: white; padding: 8px 16px;
      border-radius: 8px; text-decoration: none; font-size: 14px; transition: background 0.2s;
    }
    .btn-ver:hover { background: #154360; }
    .estado-carga { text-align: center; padding: 60px; color: var(--text-muted, #666); }
    .spinner {
      width: 40px; height: 40px; border: 4px solid #f0f0f0;
      border-top-color: #1B4F72; border-radius: 50%;
      animation: spin 0.8s linear infinite; margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .estado-error { text-align: center; padding: 40px; background: #fef3f3; border-radius: 12px; color: #c0392b; }
    .btn-reintentar { margin-top: 12px; padding: 8px 20px; background: #1B4F72; color: white; border: none; border-radius: 8px; cursor: pointer; }
    .sin-resultados { text-align: center; padding: 60px; color: var(--text-muted, #888); font-size: 16px; }
    .contador { text-align: center; margin-top: 24px; color: var(--text-muted, #888); font-size: 13px; }
  `]
})
export class ListaViajesComponent implements OnInit {

  viajes: Viaje[] = [];
  cargando = true;
  error = false;

  // Filtros
  filtroPais = '';
  filtroPrecioMin: number | null = null;
  filtroPrecioMax: number | null = null;
  filtroPlazasMin: number | null = null;
  filtroValoracionMin: number | null = null;
  filtroFechaSalida: string = '';
  filtroOrden = '';

  mostrarSplash = !sessionStorage.getItem('splash_visto');
  modoOscuro = localStorage.getItem('carpinchill_dark') === 'true';

  constructor(private viajesService: ViajesService) {}

  ngOnInit(): void {
    sessionStorage.setItem('splash_visto', '1');
    this.cargarViajes();
  }

  cargarViajes(): void {
    this.cargando = true;
    this.error = false;

    const filtros: any = {};
    if (this.filtroPais)            filtros.pais = this.filtroPais;
    if (this.filtroPrecioMin)       filtros.precioMin = this.filtroPrecioMin;
    if (this.filtroPrecioMax)       filtros.precioMax = this.filtroPrecioMax;
    if (this.filtroPlazasMin)       filtros.plazasMin = this.filtroPlazasMin;
    if (this.filtroValoracionMin)   filtros.valoracionMin = this.filtroValoracionMin;
    if (this.filtroFechaSalida)     filtros.fechaSalidaDesde = this.filtroFechaSalida;
    if (this.filtroOrden)           filtros.ordenar = this.filtroOrden;

    this.viajesService.getViajes(Object.keys(filtros).length ? filtros : undefined).subscribe({
      next: (viajes) => { this.viajes = viajes; this.cargando = false; },
      error: (err) => { console.error('Error al cargar viajes:', err); this.error = true; this.cargando = false; }
    });
  }

  // Cada cambio de filtro recarga desde el backend (los filtros de valoracion y fecha son del servidor)
  aplicarFiltros(): void {
    this.cargarViajes();
  }

  limpiarFiltros(): void {
    this.filtroPais = '';
    this.filtroPrecioMin = null;
    this.filtroPrecioMax = null;
    this.filtroPlazasMin = null;
    this.filtroValoracionMin = null;
    this.filtroFechaSalida = '';
    this.filtroOrden = '';
    this.cargarViajes();
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400';
  }
}