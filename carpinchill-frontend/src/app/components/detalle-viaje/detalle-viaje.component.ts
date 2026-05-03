import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ViajesService } from '../../services/viajes.service';
import { AuthService } from '../../services/auth.service';
import { ReservaService } from '../../services/reserva.service';
import { ClimaService } from '../../services/clima.service';
import { Viaje } from '../../models/viaje.model';

@Component({
  selector: 'app-detalle-viaje',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="detalle-pagina">

      <a routerLink="/viajes" class="btn-volver">← Volver al catálogo</a>

      <div *ngIf="cargando" class="estado-carga">
        <div class="spinner"></div><p>Cargando viaje...</p>
      </div>

      <div *ngIf="error" class="estado-error">
        <p>⚠️ No se pudo cargar el viaje.</p>
        <a routerLink="/viajes">Volver al catálogo</a>
      </div>

      <div *ngIf="viaje && !cargando" class="detalle-contenido">

        <!-- Imagen cabecera -->
        <div class="detalle-imagen">
          <img [src]="viaje.imagenUrl || 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800'"
               [alt]="viaje.titulo"/>
          <div class="detalle-overlay">
            <h1>{{ viaje.titulo }}</h1>
            <p>📍 {{ viaje.destino }}, {{ viaje.pais }}</p>
          </div>
        </div>

        <!-- Info grid -->
        <div class="info-grid">
          <div class="info-card">
            <span class="lbl">Precio por persona</span>
            <span class="val precio">{{ viaje.precio | currency:'EUR':'symbol':'1.0-0' }}</span>
          </div>
          <div class="info-card">
            <span class="lbl">Fechas</span>
            <span class="val">{{ viaje.fechaInicio | date:'dd MMM yyyy' }} → {{ viaje.fechaFin | date:'dd MMM yyyy' }}</span>
          </div>
          <div class="info-card">
            <span class="lbl">Plazas disponibles</span>
            <span class="val" [class.pocas]="viaje.plazasDisponibles <= 5">
              {{ viaje.plazasDisponibles }} / {{ viaje.plazasTotales }}
            </span>
          </div>
          <div class="info-card clima-card" *ngIf="clima">
            <span class="lbl">🌤️ Clima en {{ viaje.destino }}</span>
            <span class="val">{{ clima.temperatura | number:'1.0-0' }}°C — {{ clima.descripcion }}</span>
            <span class="clima-extra">💧 {{ clima.humedad }}% · 💨 {{ clima.viento }} m/s</span>
          </div>
          <div class="info-card clima-card cargando-clima" *ngIf="cargandoClima">
            <span class="lbl">🌤️ Cargando clima...</span>
          </div>
        </div>

        <!-- Descripción -->
        <div class="seccion">
          <h2>Descripción</h2>
          <p>{{ viaje.descripcion }}</p>
        </div>

        <!-- Mapa Leaflet (RF-06) -->
        <div class="seccion" *ngIf="viaje.latitud && viaje.longitud">
          <h2>📍 Ubicación del destino</h2>
          <p class="sub">Mapa interactivo — OpenStreetMap + Leaflet</p>
          <div id="mapa" class="mapa"></div>
        </div>

        <!-- Formulario de reserva (RF-04) -->
        <div class="seccion reserva-sec">
          <h2>✈️ Reservar este viaje</h2>

          <div *ngIf="!estaAutenticado()" class="reserva-login">
            <p>Debes iniciar sesión para reservar.</p>
            <a routerLink="/login" class="btn-login">Iniciar sesión →</a>
          </div>

          <div *ngIf="estaAutenticado() && viaje.plazasDisponibles === 0" class="sin-plazas">
            <p>😔 Sin plazas disponibles.</p>
          </div>

          <div *ngIf="estaAutenticado() && viaje.plazasDisponibles > 0 && !reservaOk" class="form-reserva">
            <div class="campo">
              <label>Número de personas</label>
              <div class="personas">
                <button (click)="dec()" [disabled]="numPersonas<=1">−</button>
                <span>{{ numPersonas }}</span>
                <button (click)="inc()" [disabled]="numPersonas>=viaje.plazasDisponibles">+</button>
              </div>
              <small>Máximo {{ viaje.plazasDisponibles }} plaza(s)</small>
            </div>
            <div class="campo">
              <label>Notas (opcional)</label>
              <textarea [(ngModel)]="notas" rows="2" placeholder="Peticiones especiales..."></textarea>
            </div>
            <div class="resumen">
              <div class="resumen-fila"><span>Precio/persona</span><span>{{ viaje.precio | currency:'EUR':'symbol':'1.0-0' }}</span></div>
              <div class="resumen-fila"><span>Personas</span><span>× {{ numPersonas }}</span></div>
              <div class="resumen-fila total"><span>Total</span><span>{{ viaje.precio * numPersonas | currency:'EUR':'symbol':'1.0-0' }}</span></div>
            </div>
            <div *ngIf="errorReserva" class="error-reserva">⚠️ {{ errorReserva }}</div>
            <button class="btn-reservar" (click)="reservar()" [disabled]="reservando">
              {{ reservando ? 'Procesando...' : '✈️ Confirmar reserva' }}
            </button>
          </div>

          <div *ngIf="reservaOk" class="reserva-confirmada">
            <div class="ok-icono">✅</div>
            <h3>¡Reserva realizada!</h3>
            <p>Estado: <strong>PENDIENTE</strong>. Un agente la confirmará en breve.</p>
            <div class="ok-det">{{ numPersonas }} persona(s) · {{ viaje.precio * numPersonas | currency:'EUR':'symbol':'1.0-0' }}</div>
            <button (click)="nuevaReserva()">Hacer otra reserva</button>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .detalle-pagina { padding: 16px 0; }
    .btn-volver { display: inline-block; color: #1B4F72; text-decoration: none; margin-bottom: 18px; font-size: 14px; }
    .detalle-imagen { position: relative; height: 320px; border-radius: 14px; overflow: hidden; margin-bottom: 20px; }
    .detalle-imagen img { width: 100%; height: 100%; object-fit: cover; }
    .detalle-overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 20px; background: linear-gradient(transparent, rgba(0,0,0,0.7)); color: white; }
    .detalle-overlay h1 { margin: 0 0 4px; font-size: 26px; }
    .detalle-overlay p { margin: 0; opacity: 0.85; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; margin-bottom: 24px; }
    .info-card { background: #f8f9fa; border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 4px; }
    .lbl { font-size: 11px; color: #888; font-weight: 700; text-transform: uppercase; }
    .val { font-size: 15px; color: #333; font-weight: 500; }
    .val.precio { font-size: 22px; color: #1B4F72; font-weight: bold; }
    .pocas { color: #e74c3c; }
    .clima-extra { font-size: 12px; color: #888; }
    .cargando-clima .lbl { color: #aaa; }
    .seccion { margin-bottom: 28px; }
    .seccion h2 { color: #1B4F72; margin: 0 0 10px; font-size: 18px; }
    .seccion p { color: #444; line-height: 1.7; margin: 0; }
    .sub { color: #888; font-size: 13px; margin: -6px 0 10px; }
    .mapa { height: 300px; border-radius: 10px; overflow: hidden; border: 1px solid #e0e0e0; background: #f0f4f8; }
    .reserva-sec { background: #f8f9fa; border-radius: 14px; padding: 22px; }
    .reserva-login { text-align: center; padding: 16px; }
    .reserva-login p { color: #666; margin-bottom: 12px; }
    .btn-login { display: inline-block; background: #1B4F72; color: white; padding: 9px 22px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .sin-plazas { text-align: center; padding: 16px; color: #c0392b; background: #fdecea; border-radius: 8px; }
    .form-reserva { max-width: 440px; }
    .campo { margin-bottom: 16px; }
    .campo label { display: block; font-size: 13px; font-weight: 600; color: #555; margin-bottom: 6px; }
    .campo small { color: #888; font-size: 12px; display: block; margin-top: 4px; }
    .campo textarea { width: 100%; padding: 8px 10px; border: 1px solid #ddd; border-radius: 7px; font-size: 14px; resize: vertical; font-family: inherit; }
    .personas { display: flex; align-items: center; gap: 14px; }
    .personas button { width: 32px; height: 32px; border-radius: 50%; border: 2px solid #1B4F72; background: white; color: #1B4F72; font-size: 18px; cursor: pointer; }
    .personas button:disabled { opacity: 0.3; cursor: not-allowed; }
    .personas span { font-size: 22px; font-weight: bold; color: #1B4F72; min-width: 28px; text-align: center; }
    .resumen { background: white; border-radius: 8px; padding: 14px; margin-bottom: 16px; border: 1px solid #e0e0e0; }
    .resumen-fila { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; color: #555; border-bottom: 1px solid #f0f0f0; }
    .resumen-fila:last-child { border-bottom: none; }
    .resumen-fila.total { font-size: 17px; font-weight: bold; color: #1B4F72; padding-top: 10px; margin-top: 4px; }
    .error-reserva { background: #fdecea; color: #c0392b; padding: 8px 12px; border-radius: 6px; margin-bottom: 12px; font-size: 13px; }
    .btn-reservar { width: 100%; padding: 13px; background: #1B4F72; color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; }
    .btn-reservar:disabled { background: #aaa; cursor: not-allowed; }
    .reserva-confirmada { text-align: center; padding: 20px; }
    .ok-icono { font-size: 44px; margin-bottom: 10px; }
    .reserva-confirmada h3 { color: #1e8449; margin: 0 0 6px; }
    .reserva-confirmada p { color: #555; margin: 0 0 12px; }
    .ok-det { background: #d5f5e3; color: #1e8449; padding: 8px 18px; border-radius: 6px; display: inline-block; margin-bottom: 16px; font-weight: 600; font-size: 14px; }
    .reserva-confirmada button { background: none; border: 2px solid #1B4F72; color: #1B4F72; padding: 8px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; }
    .estado-carga, .estado-error { text-align: center; padding: 50px; color: #666; }
    .spinner { width: 32px; height: 32px; border: 4px solid #f0f0f0; border-top-color: #1B4F72; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 12px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 600px) {
      .detalle-imagen { height: 200px; }
      .mapa { height: 220px; }
      .form-reserva { max-width: 100%; }
    }
  `]
})
export class DetalleViajeComponent implements OnInit, AfterViewInit, OnDestroy {

  viaje: Viaje | null = null;
  cargando = true;
  error = false;
  clima: any = null;
  cargandoClima = false;

  numPersonas = 1;
  notas = '';
  reservando = false;
  reservaOk = false;
  errorReserva = '';

  private mapa: any = null;

  constructor(
    private route: ActivatedRoute,
    private viajesService: ViajesService,
    private authService: AuthService,
    private reservaService: ReservaService,
    private climaService: ClimaService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.viajesService.getViajePorId(id).subscribe({
      next: (v) => {
        this.viaje = v;
        this.cargando = false;
        // Cargar clima si hay coordenadas
        if (v.latitud && v.longitud) {
          this.cargarClima(v.latitud, v.longitud);
        }
      },
      error: () => { this.error = true; this.cargando = false; }
    });
  }

  ngAfterViewInit(): void {
    this.esperarMapa();
  }

  private cargarClima(lat: number, lon: number): void {
    this.cargandoClima = true;
    this.climaService.getClima(lat, lon).subscribe({
      next: (c) => { this.clima = c; this.cargandoClima = false; },
      error: () => { this.cargandoClima = false; }
    });
  }

  private esperarMapa(intentos = 0): void {
    if (this.viaje?.latitud && this.viaje?.longitud) {
      this.inicializarMapa();
    } else if (intentos < 20) {
      setTimeout(() => this.esperarMapa(intentos + 1), 200);
    }
  }

  private inicializarMapa(): void {
    if (!this.viaje?.latitud || !this.viaje?.longitud) return;
    const L = (window as any)['L'];
    if (!L) { console.warn('Leaflet no cargado'); return; }
    const div = document.getElementById('mapa');
    if (!div) return;

    this.mapa = L.map('mapa').setView([this.viaje.latitud, this.viaje.longitud], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18
    }).addTo(this.mapa);
    L.marker([this.viaje.latitud, this.viaje.longitud])
      .addTo(this.mapa)
      .bindPopup(`<b>${this.viaje.destino}</b><br>${this.viaje.pais}`)
      .openPopup();
  }

  ngOnDestroy(): void {
    if (this.mapa) { this.mapa.remove(); this.mapa = null; }
  }

  estaAutenticado(): boolean { return this.authService.estaAutenticado(); }
  dec(): void { if (this.numPersonas > 1) this.numPersonas--; }
  inc(): void { if (this.viaje && this.numPersonas < this.viaje.plazasDisponibles) this.numPersonas++; }

  reservar(): void {
    if (!this.viaje?.id) return;
    this.reservando = true;
    this.errorReserva = '';
    this.reservaService.crearReserva({
      viajeId: this.viaje.id,
      numPersonas: this.numPersonas,
      notas: this.notas
    }).subscribe({
      next: () => {
        this.reservaOk = true;
        this.reservando = false;
        if (this.viaje) this.viaje.plazasDisponibles -= this.numPersonas;
      },
      error: (err) => {
        this.errorReserva = err.error || 'No se pudo completar la reserva.';
        this.reservando = false;
      }
    });
  }

  nuevaReserva(): void {
    this.reservaOk = false;
    this.numPersonas = 1;
    this.notas = '';
    this.errorReserva = '';
  }
}
