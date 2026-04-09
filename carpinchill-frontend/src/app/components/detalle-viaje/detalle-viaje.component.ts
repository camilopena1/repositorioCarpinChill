import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ViajesService } from '../../services/viajes.service';
import { Viaje } from '../../models/viaje.model';

@Component({
  selector: 'app-detalle-viaje',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="detalle-pagina">

      <a routerLink="/viajes" class="btn-volver">← Volver al catálogo</a>

      <div *ngIf="cargando" class="cargando">Cargando viaje...</div>

      <div *ngIf="error" class="error">
        <p>⚠️ No se pudo cargar el viaje.</p>
        <a routerLink="/viajes">Volver al catálogo</a>
      </div>

      <div *ngIf="viaje && !cargando" class="detalle-contenido">

        <!-- Imagen de cabecera -->
        <div class="detalle-imagen">
          <img
            [src]="viaje.imagenUrl || 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800'"
            [alt]="viaje.titulo"
          />
          <div class="detalle-overlay">
            <h1>{{ viaje.titulo }}</h1>
            <p>📍 {{ viaje.destino }}, {{ viaje.pais }}</p>
          </div>
        </div>

        <!-- Info principal -->
        <div class="detalle-info">

          <div class="info-grid">
            <div class="info-card">
              <span class="info-label">Precio por persona</span>
              <span class="info-valor precio">{{ viaje.precio | currency:'EUR':'symbol':'1.2-2' }}</span>
            </div>
            <div class="info-card">
              <span class="info-label">Fechas</span>
              <span class="info-valor">
                {{ viaje.fechaInicio | date:'dd MMM yyyy' }} →
                {{ viaje.fechaFin | date:'dd MMM yyyy' }}
              </span>
            </div>
            <div class="info-card">
              <span class="info-label">Plazas disponibles</span>
              <span class="info-valor" [class.pocas]="viaje.plazasDisponibles <= 5">
                {{ viaje.plazasDisponibles }} / {{ viaje.plazasTotales }}
              </span>
            </div>
            <div class="info-card">
              <span class="info-label">Destino</span>
              <span class="info-valor">{{ viaje.destino }}, {{ viaje.pais }}</span>
            </div>
          </div>

          <div class="descripcion-completa">
            <h2>Descripción</h2>
            <p>{{ viaje.descripcion }}</p>
          </div>

          <div class="acciones">
            <button class="btn-reservar" [disabled]="viaje.plazasDisponibles === 0">
              {{ viaje.plazasDisponibles === 0 ? 'Sin plazas disponibles' : '✈️ Reservar este viaje' }}
            </button>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .detalle-pagina { padding: 16px 0; }
    .btn-volver {
      display: inline-block;
      color: #1B4F72;
      text-decoration: none;
      margin-bottom: 20px;
      font-size: 14px;
    }
    .btn-volver:hover { text-decoration: underline; }

    .detalle-imagen {
      position: relative;
      height: 380px;
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 28px;
    }
    .detalle-imagen img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .detalle-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 24px;
      background: linear-gradient(transparent, rgba(0,0,0,0.7));
      color: white;
    }
    .detalle-overlay h1 { margin: 0 0 6px; font-size: 28px; }
    .detalle-overlay p { margin: 0; opacity: 0.85; }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }
    .info-card {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .info-label { font-size: 12px; color: #888; font-weight: 600; text-transform: uppercase; }
    .info-valor { font-size: 16px; color: #333; font-weight: 500; }
    .info-valor.precio { font-size: 24px; color: #1B4F72; font-weight: bold; }
    .info-valor.pocas { color: #e74c3c; }

    .descripcion-completa h2 { color: #1B4F72; margin-bottom: 12px; }
    .descripcion-completa p { color: #444; line-height: 1.7; font-size: 15px; }

    .acciones { margin-top: 28px; }
    .btn-reservar {
      padding: 14px 32px;
      background: #1B4F72;
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-reservar:hover:not(:disabled) { background: #154360; }
    .btn-reservar:disabled { background: #ccc; cursor: not-allowed; }

    .cargando, .error { text-align: center; padding: 60px; color: #666; }
  `]
})
export class DetalleViajeComponent implements OnInit {

  viaje: Viaje | null = null;
  cargando = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private viajesService: ViajesService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.viajesService.getViajePorId(id).subscribe({
      next: (viaje) => {
        this.viaje = viaje;
        this.cargando = false;
      },
      error: () => {
        this.error = true;
        this.cargando = false;
      }
    });
  }
}
