import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ViajesService } from '../../services/viajes.service';
import { AuthService } from '../../services/auth.service';
import { ReservaService } from '../../services/reserva.service';
import { ClimaService } from '../../services/clima.service';
import { ComentarioService, Comentario } from '../../services/comentario.service';
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
          <div class="info-card" *ngIf="mediaValoracion !== null">
            <span class="lbl">⭐ Valoración media</span>
            <span class="val">{{ mediaValoracion | number:'1.1-1' }} / 5
              <small>({{ comentarios.length }} reseña{{ comentarios.length !== 1 ? 's' : '' }})</small>
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

        <!-- Mapa Leaflet -->
        <div class="seccion" *ngIf="viaje.latitud && viaje.longitud">
          <h2>📍 Ubicación del destino</h2>
          <p class="sub">Mapa interactivo — OpenStreetMap + Leaflet</p>
          <div id="mapa" class="mapa"></div>
        </div>

        <!-- Formulario de reserva -->
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

        <!-- ===== SECCIÓN DE COMENTARIOS Y VALORACIONES ===== -->
        <div class="seccion comentarios-sec">
          <h2>💬 Opiniones de viajeros</h2>

          <!-- Formulario para añadir comentario (solo autenticados) -->
          <div *ngIf="estaAutenticado() && !comentarioEnviado" class="form-comentario">
            <h3>Deja tu valoración</h3>
            <div class="campo">
              <label>Puntuación</label>
              <div class="estrellas-input">
                <button *ngFor="let s of [1,2,3,4,5]"
                        class="estrella-btn"
                        [class.activa]="nuevaValoracion >= s"
                        (click)="nuevaValoracion = s">★</button>
                <span class="estrella-label" *ngIf="nuevaValoracion > 0">{{ nuevaValoracion }}/5</span>
              </div>
            </div>
            <div class="campo">
              <label>Comentario (opcional)</label>
              <textarea [(ngModel)]="nuevoComentario" rows="3"
                        placeholder="Comparte tu experiencia con este viaje..."></textarea>
            </div>
            <div *ngIf="errorComentario" class="error-reserva">⚠️ {{ errorComentario }}</div>
            <button class="btn-comentar" (click)="enviarComentario()" [disabled]="enviandoComentario || nuevaValoracion === 0">
              {{ enviandoComentario ? 'Enviando...' : '📝 Publicar opinión' }}
            </button>
          </div>

          <div *ngIf="comentarioEnviado" class="comentario-ok">
            ✅ ¡Gracias por tu opinión!
          </div>

          <div *ngIf="!estaAutenticado()" class="reserva-login" style="margin-top:12px">
            <p>Inicia sesión para dejar una valoración.</p>
          </div>

          <!-- Lista de comentarios -->
          <div *ngIf="cargandoComentarios" class="estado-carga" style="padding:24px">
            <div class="spinner"></div>
          </div>

          <div *ngIf="!cargandoComentarios && comentarios.length === 0" class="sin-comentarios">
            <p>Aún no hay opiniones para este viaje. ¡Sé el primero!</p>
          </div>

          <div class="lista-comentarios" *ngIf="!cargandoComentarios && comentarios.length > 0">
            <div *ngFor="let c of comentarios" class="comentario-card">
              <div class="comentario-header">
                <div class="comentario-autor" (click)="abrirModal(c)" style="cursor:pointer">
                  <!-- Foto de perfil del usuario o iniciales -->
                  <div class="avatar-comentario">
                    <img *ngIf="c.usuario?.imagenUrl" [src]="c.usuario?.imagenUrl" [alt]="c.usuario?.nombre" class="avatar-img" (error)="onAvatarComentarioError($event, c)"/>
                    <div *ngIf="!c.usuario?.imagenUrl" class="avatar-iniciales">{{ getIniciales(c) }}</div>
                  </div>
                  <div class="autor-info">
                    <span class="nombre-autor">{{ c.usuario?.nombre || 'Usuario' }} {{ c.usuario?.apellidos || '' }}</span>
                    <span class="bandera-usuario" *ngIf="getBandera(c.usuario?.paisCodigo)">{{ getBandera(c.usuario?.paisCodigo) }}</span>
                  </div>
                </div>
                <div class="comentario-meta">
                  <div class="estrellas">
                    <span *ngFor="let s of getEstrellas(c.valoracion)" [class.llena]="s">★</span>
                  </div>
                  <span class="fecha-comentario">{{ c.fechaComentario | date:'dd/MM/yyyy' }}</span>
                  <span class="fecha-edicion" *ngIf="c.fechaEdicion">· Editado {{ c.fechaEdicion | date:'dd/MM/yyyy' }}</span>
                </div>
              </div>
              <p class="comentario-texto" *ngIf="c.comentario">{{ c.comentario }}</p>
            </div>
          </div>

          <!-- Modal perfil usuario -->
          <div class="modal-overlay" *ngIf="usuarioModal" (click)="cerrarModal()">
            <div class="modal-card" (click)="$event.stopPropagation()">
              <button class="modal-cerrar" (click)="cerrarModal()">✕</button>
              <div class="modal-avatar">
                <img *ngIf="usuarioModal.imagenUrl" [src]="usuarioModal.imagenUrl" alt="foto"/>
                <div *ngIf="!usuarioModal.imagenUrl" class="modal-iniciales">{{ (usuarioModal.nombre || '?').charAt(0) }}</div>
              </div>
              <h3>{{ usuarioModal.nombre }} {{ usuarioModal.apellidos }}</h3>
              <p class="modal-bandera" *ngIf="getBandera(usuarioModal.paisCodigo)">{{ getBandera(usuarioModal.paisCodigo) }} {{ getNombrePais(usuarioModal.paisCodigo) }}</p>
              <p class="modal-email">{{ usuarioModal.email }}</p>
            </div>
          </div>
        </div>
        <!-- ===== FIN SECCIÓN COMENTARIOS ===== -->

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
    .campo textarea { width: 100%; padding: 8px 10px; border: 1px solid #ddd; border-radius: 7px; font-size: 14px; resize: vertical; font-family: inherit; box-sizing: border-box; }
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

    /* Comentarios */
    .comentarios-sec { background: #f8f9fa; border-radius: 14px; padding: 22px; }
    .avatar-comentario { width:40px; height:40px; border-radius:50%; overflow:hidden; flex-shrink:0; border:2px solid #1B4F72; }
    .avatar-img { width:100%; height:100%; object-fit:cover; }
    .avatar-iniciales { width:100%; height:100%; background:#1B4F72; color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:16px; }
    .autor-info { display:flex; align-items:center; gap:6px; }
    .nombre-autor { font-weight:600; font-size:14px; }
    .bandera-usuario { font-size:18px; }
    .fecha-edicion { font-size:11px; color:#999; font-style:italic; }
    .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000; }
    .modal-card { background:white; border-radius:20px; padding:32px; text-align:center; min-width:280px; position:relative; box-shadow:0 8px 32px rgba(0,0,0,0.2); }
    .modal-cerrar { position:absolute; top:12px; right:16px; background:none; border:none; font-size:20px; cursor:pointer; color:#999; }
    .modal-avatar { width:80px; height:80px; border-radius:50%; overflow:hidden; margin:0 auto 16px; border:3px solid #1B4F72; }
    .modal-avatar img { width:100%; height:100%; object-fit:cover; }
    .modal-iniciales { width:100%; height:100%; background:#1B4F72; color:white; display:flex; align-items:center; justify-content:center; font-size:32px; font-weight:700; }
    .modal-card h3 { margin:0 0 8px; color:#1B4F72; }
    .modal-bandera { font-size:18px; margin:4px 0; }
    .modal-email { color:#888; font-size:13px; margin:4px 0 0; }
    .form-comentario { background: white; border-radius: 10px; padding: 18px; margin-bottom: 20px; border: 1px solid #e8e8e8; }
    .form-comentario h3 { margin: 0 0 14px; font-size: 15px; color: #1B4F72; }
    .estrellas-input { display: flex; align-items: center; gap: 6px; }
    .estrella-btn { background: none; border: none; font-size: 28px; cursor: pointer; color: #ddd; transition: color 0.15s; padding: 0; line-height: 1; }
    .estrella-btn.activa { color: #f39c12; }
    .estrella-btn:hover { color: #f39c12; }
    .estrella-label { font-size: 13px; color: #888; margin-left: 4px; }
    .btn-comentar { padding: 10px 22px; background: #1B4F72; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .btn-comentar:disabled { background: #aaa; cursor: not-allowed; }
    .comentario-ok { background: #d5f5e3; color: #1e8449; padding: 12px 16px; border-radius: 8px; font-weight: 600; margin-bottom: 16px; }
    .sin-comentarios { text-align: center; padding: 28px; color: #aaa; font-size: 14px; }
    .lista-comentarios { display: flex; flex-direction: column; gap: 14px; margin-top: 8px; }
    .comentario-card { background: white; border-radius: 10px; padding: 16px; border: 1px solid #e8e8e8; }
    .comentario-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; flex-wrap: wrap; gap: 8px; }
    .comentario-autor { display: flex; align-items: center; gap: 10px; }
    .avatar { width: 36px; height: 36px; border-radius: 50%; background: #1B4F72; color: white; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; }
    .nombre-autor { font-weight: 600; color: #333; font-size: 14px; }
    .comentario-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
    .estrellas { color: #ddd; font-size: 16px; letter-spacing: 1px; }
    .estrellas .llena { color: #f39c12; }
    .fecha-comentario { font-size: 11px; color: #aaa; }
    .comentario-texto { color: #555; font-size: 14px; line-height: 1.6; margin: 0; }

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

  // Reserva
  numPersonas = 1;
  notas = '';
  reservando = false;
  reservaOk = false;
  errorReserva = '';

  // Comentarios
  comentarios: Comentario[] = [];
  cargandoComentarios = false;
  mediaValoracion: number | null = null;
  nuevaValoracion = 0;
  nuevoComentario = '';
  enviandoComentario = false;
  comentarioEnviado = false;
  errorComentario = '';

  private mapa: any = null;

  constructor(
    private route: ActivatedRoute,
    private viajesService: ViajesService,
    private authService: AuthService,
    private reservaService: ReservaService,
    private climaService: ClimaService,
    private comentarioService: ComentarioService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.viajesService.getViajePorId(id).subscribe({
      next: (v) => {
        this.viaje = v;
        this.cargando = false;
        if (v.latitud && v.longitud) {
          this.cargarClima(v.latitud, v.longitud);
        }
        this.cargarComentarios(id);
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

  private cargarComentarios(viajeId: number): void {
    this.cargandoComentarios = true;
    this.comentarioService.getComentariosPorViaje(viajeId).subscribe({
      next: (lista) => {
        this.comentarios = lista;
        this.cargandoComentarios = false;
        if (lista.length > 0) {
          const suma = lista.reduce((acc, c) => acc + c.valoracion, 0);
          this.mediaValoracion = Math.round((suma / lista.length) * 10) / 10;
        }
      },
      error: () => { this.cargandoComentarios = false; }
    });
  }

  enviarComentario(): void {
    if (!this.viaje?.id || this.nuevaValoracion === 0) return;
    this.enviandoComentario = true;
    this.errorComentario = '';
    this.comentarioService.crearComentario(this.viaje.id, this.nuevaValoracion, this.nuevoComentario).subscribe({
      next: (c) => {
        this.comentarios = [c, ...this.comentarios];
        this.comentarioEnviado = true;
        this.enviandoComentario = false;
        // Recalcular media
        const suma = this.comentarios.reduce((acc, com) => acc + com.valoracion, 0);
        this.mediaValoracion = Math.round((suma / this.comentarios.length) * 10) / 10;
      },
      error: (err) => {
        this.errorComentario = typeof err.error === 'string' ? err.error : 'No se pudo publicar el comentario.';
        this.enviandoComentario = false;
      }
    });
  }

  getEstrellas(valoracion: number): boolean[] {
    return [1, 2, 3, 4, 5].map(i => i <= valoracion);
  }

  usuarioModal: any = null;

  private PAISES: Record<string, {nombre: string, bandera: string}> = {
    'ES': {nombre:'España', bandera:'🇪🇸'}, 'FR': {nombre:'Francia', bandera:'🇫🇷'},
    'DE': {nombre:'Alemania', bandera:'🇩🇪'}, 'IT': {nombre:'Italia', bandera:'🇮🇹'},
    'PT': {nombre:'Portugal', bandera:'🇵🇹'}, 'GB': {nombre:'Reino Unido', bandera:'🇬🇧'},
    'US': {nombre:'Estados Unidos', bandera:'🇺🇸'}, 'MX': {nombre:'México', bandera:'🇲🇽'},
    'AR': {nombre:'Argentina', bandera:'🇦🇷'}, 'CO': {nombre:'Colombia', bandera:'🇨🇴'},
    'CL': {nombre:'Chile', bandera:'🇨🇱'}, 'PE': {nombre:'Perú', bandera:'🇵🇪'},
    'VE': {nombre:'Venezuela', bandera:'🇻🇪'}, 'EC': {nombre:'Ecuador', bandera:'🇪🇨'},
    'MA': {nombre:'Marruecos', bandera:'🇲🇦'}, 'JP': {nombre:'Japón', bandera:'🇯🇵'},
    'NO': {nombre:'Noruega', bandera:'🇳🇴'}, 'OTHER': {nombre:'Otro', bandera:'🌍'}
  };

  getBandera(codigo?: string): string {
    return codigo ? (this.PAISES[codigo]?.bandera || '') : '';
  }

  getNombrePais(codigo?: string): string {
    return codigo ? (this.PAISES[codigo]?.nombre || '') : '';
  }

  abrirModal(c: Comentario): void {
    if (c.usuario) this.usuarioModal = c.usuario;
  }

  cerrarModal(): void {
    this.usuarioModal = null;
  }

  onAvatarComentarioError(event: Event, c: Comentario): void {
    if (c.usuario) c.usuario.imagenUrl = undefined;
  }

  getIniciales(c: Comentario): string {
    const nombre = c.usuario?.nombre || '?';
    return nombre.charAt(0).toUpperCase();
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
