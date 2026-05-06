import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ViajesService } from '../../services/viajes.service';
import { AuthService } from '../../services/auth.service';
import { ReservaService, ReservaResponse } from '../../services/reserva.service';
import { Viaje } from '../../models/viaje.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="admin-pagina">

      <!-- Cabecera con tabs -->
      <div class="admin-cabecera">
        <div>
          <h1>⚙️ Panel de administración</h1>
        </div>
        <div class="tabs">
          <button class="tab" [class.activo]="tab === 'viajes'" (click)="tab = 'viajes'; cargarTodos()">
            🌍 Viajes ({{ viajes.length }})
          </button>
          <button class="tab" [class.activo]="tab === 'reservas'" (click)="tab = 'reservas'; cargarReservas()">
            📋 Reservas ({{ reservas.length }})
          </button>
        </div>
      </div>

      <!-- Mensaje -->
      <div *ngIf="mensaje" class="mensaje" [class.error]="esError">{{ mensaje }}</div>

      <!-- Estado de carga -->
      <div *ngIf="cargando" class="cargando">
        <div class="spinner"></div>
        <p>Cargando...</p>
      </div>

      <!-- ===== TAB VIAJES ===== -->
      <div *ngIf="tab === 'viajes' && !cargando">
        <div class="tab-cabecera">
          <span>{{ viajes.length }} viajes registrados</span>
          <button class="btn-nuevo" (click)="abrirFormulario(null)">+ Nuevo viaje</button>
        </div>
        <div class="tabla-contenedor">
          <table class="tabla-admin">
            <thead>
              <tr>
                <th>ID</th><th>Título</th><th>Destino</th><th>País</th>
                <th>Precio</th><th>Plazas</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let viaje of viajes" [class.inactivo]="!viaje.activo">
                <td>{{ viaje.id }}</td>
                <td><a [routerLink]="['/viajes', viaje.id]" class="link-titulo">{{ viaje.titulo }}</a></td>
                <td>{{ viaje.destino }}</td>
                <td>{{ viaje.pais }}</td>
                <td>{{ viaje.precio | currency:'EUR':'symbol':'1.0-0' }}</td>
                <td><span [class.pocas]="viaje.plazasDisponibles <= 5">{{ viaje.plazasDisponibles }}/{{ viaje.plazasTotales }}</span></td>
                <td>
                  <span class="badge" [class.badge-activo]="viaje.activo" [class.badge-inactivo]="!viaje.activo">
                    {{ viaje.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="acciones">
                  <button class="btn-accion" (click)="abrirFormulario(viaje)" title="Editar">✏️</button>
                  <button class="btn-accion" (click)="toggleActivo(viaje)" [title]="viaje.activo ? 'Desactivar' : 'Activar'">
                    {{ viaje.activo ? '🚫' : '✅' }}
                  </button>
                  <button class="btn-accion btn-danger" (click)="confirmarEliminar(viaje)" title="Eliminar">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ===== TAB RESERVAS ===== -->
      <div *ngIf="tab === 'reservas' && !cargando">
        <div class="tab-cabecera">
          <span>{{ reservas.length }} reservas en total</span>
          <div class="filtro-estado">
            <label>Filtrar:</label>
            <select [(ngModel)]="filtroEstado" (change)="filtrarReservas()">
              <option value="">Todas</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="CONFIRMADA">Confirmadas</option>
              <option value="CANCELADA">Canceladas</option>
            </select>
          </div>
        </div>
        <div class="tabla-contenedor">
          <table class="tabla-admin">
            <thead>
              <tr>
                <th>ID</th><th>Cliente</th><th>Viaje</th><th>Personas</th>
                <th>Total</th><th>Fecha</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of reservasFiltradas">
                <td>{{ r.id }}</td>
                <td>{{ r.nombreUsuario }}</td>
                <td>{{ r.tituloViaje }}</td>
                <td>{{ r.numPersonas }}</td>
                <td>{{ r.precioTotal | currency:'EUR':'symbol':'1.0-0' }}</td>
                <td>{{ r.fechaReserva | date:'dd/MM/yyyy' }}</td>
                <td>
                  <span class="badge"
                    [class.badge-pendiente]="r.estado === 'PENDIENTE'"
                    [class.badge-activo]="r.estado === 'CONFIRMADA'"
                    [class.badge-cancelada]="r.estado === 'CANCELADA'">
                    {{ r.estado }}
                  </span>
                </td>
                <td class="acciones">
                  <button *ngIf="r.estado === 'PENDIENTE'" class="btn-accion btn-confirmar"
                    (click)="confirmarReserva(r)" title="Confirmar">✅ Confirmar</button>
                  <button *ngIf="r.estado === 'PENDIENTE' || r.estado === 'CONFIRMADA'"
                    class="btn-accion btn-cancelar-res" (click)="cancelarReserva(r)" title="Cancelar">❌ Cancelar</button>
                  <span *ngIf="r.estado === 'CANCELADA'" class="sin-acciones">—</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div *ngIf="reservasFiltradas.length === 0" class="sin-datos">
            No hay reservas con el filtro seleccionado.
          </div>
        </div>
      </div>

      <!-- Modal crear/editar viaje -->
      <div *ngIf="mostrarFormulario" class="modal-overlay" (click)="cerrarFormulario()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-cabecera">
            <h2>{{ viajeEditando?.id ? 'Editar viaje' : 'Nuevo viaje' }}</h2>
            <button class="btn-cerrar" (click)="cerrarFormulario()">✕</button>
          </div>
          <div class="modal-cuerpo">
            <div class="campo"><label>Título *</label><input [(ngModel)]="form.titulo" placeholder="Ej: Escapada a París" /></div>
            <div class="campo"><label>Descripción</label><textarea [(ngModel)]="form.descripcion" rows="3" placeholder="Descripción del viaje..."></textarea></div>
            <div class="fila-2">
              <div class="campo"><label>Destino *</label><input [(ngModel)]="form.destino" placeholder="Ej: París" /></div>
              <div class="campo"><label>País *</label><input [(ngModel)]="form.pais" placeholder="Ej: Francia" /></div>
            </div>
            <div class="fila-2">
              <div class="campo"><label>Latitud</label><input type="number" [(ngModel)]="form.latitud" placeholder="Ej: 48.8566" /></div>
              <div class="campo"><label>Longitud</label><input type="number" [(ngModel)]="form.longitud" placeholder="Ej: 2.3522" /></div>
            </div>
            <div class="fila-2">
              <div class="campo"><label>Precio (€) *</label><input type="number" [(ngModel)]="form.precio" placeholder="Ej: 899" /></div>
              <div class="campo"><label>Plazas totales</label><input type="number" [(ngModel)]="form.plazasTotales" placeholder="Ej: 20" /></div>
            </div>
            <div class="fila-2">
              <div class="campo"><label>Fecha inicio</label><input type="date" [(ngModel)]="form.fechaInicio" /></div>
              <div class="campo"><label>Fecha fin</label><input type="date" [(ngModel)]="form.fechaFin" /></div>
            </div>
            <div class="campo"><label>URL imagen</label><input [(ngModel)]="form.imagenUrl" placeholder="https://images.unsplash.com/... (clic derecho → 'Copiar dirección de imagen')" /></div>
          </div>
          <div class="modal-pie">
            <button class="btn-cancelar" (click)="cerrarFormulario()">Cancelar</button>
            <button class="btn-guardar" (click)="guardar()" [disabled]="guardando">
              {{ guardando ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal confirmar eliminar viaje -->
      <div *ngIf="mostrarConfirmacion" class="modal-overlay">
        <div class="modal modal-pequeno">
          <h2>¿Eliminar viaje?</h2>
          <p>Esta acción no se puede deshacer. El viaje <strong>{{ viajeAEliminar?.titulo }}</strong> se borrará permanentemente.</p>
          <div class="modal-pie">
            <button class="btn-cancelar" (click)="mostrarConfirmacion = false">Cancelar</button>
            <button class="btn-eliminar-confirm" (click)="eliminar()">Sí, eliminar</button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .admin-pagina { padding: 16px 0; }
    .admin-cabecera { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
    .admin-cabecera h1 { font-size: 24px; color: #1B4F72; margin: 0; }
    .tabs { display: flex; gap: 8px; }
    .tab { padding: 9px 18px; border: 2px solid #1B4F72; background: white; color: #1B4F72; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.2s; }
    .tab.activo { background: #1B4F72; color: white; }
    .tab-cabecera { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    .tab-cabecera span { color: #888; font-size: 13px; }
    .btn-nuevo { background: #1B4F72; color: white; border: none; padding: 9px 18px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; }
    .btn-nuevo:hover { background: #154360; }
    .filtro-estado { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #555; }
    .filtro-estado select { padding: 6px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; }
    .mensaje { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; background: #d5f5e3; color: #1e8449; font-size: 14px; }
    .mensaje.error { background: #fdecea; color: #c0392b; }
    .tabla-contenedor { overflow-x: auto; }
    .tabla-admin { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.07); }
    .tabla-admin th { background: #1B4F72; color: white; padding: 11px 13px; text-align: left; font-size: 13px; }
    .tabla-admin td { padding: 11px 13px; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: #333; }
    .tabla-admin tr:last-child td { border-bottom: none; }
    .tabla-admin tr.inactivo td { opacity: 0.5; }
    .tabla-admin tr:hover td { background: #f8f9fa; }
    .link-titulo { color: #1B4F72; text-decoration: none; font-weight: 500; }
    .link-titulo:hover { text-decoration: underline; }
    .pocas { color: #e74c3c; font-weight: 600; }
    .badge { padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 700; }
    .badge-activo { background: #d5f5e3; color: #1e8449; }
    .badge-inactivo { background: #f0f0f0; color: #888; }
    .badge-pendiente { background: #fef9e7; color: #d68910; }
    .badge-cancelada { background: #fdecea; color: #c0392b; }
    .acciones { display: flex; gap: 5px; flex-wrap: wrap; }
    .btn-accion { background: none; border: 1px solid #ddd; border-radius: 6px; padding: 4px 9px; cursor: pointer; font-size: 12px; transition: background 0.15s; white-space: nowrap; }
    .btn-accion:hover { background: #f0f0f0; }
    .btn-confirmar { border-color: #1e8449; color: #1e8449; }
    .btn-confirmar:hover { background: #d5f5e3; }
    .btn-cancelar-res { border-color: #c0392b; color: #c0392b; }
    .btn-cancelar-res:hover { background: #fdecea; }
    .btn-danger:hover { background: #fdecea; }
    .sin-acciones { color: #ccc; font-size: 13px; }
    .sin-datos { text-align: center; padding: 32px; color: #aaa; font-size: 14px; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 16px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
    .modal-pequeno { max-width: 420px; padding: 28px; }
    .modal-pequeno h2 { margin: 0 0 12px; color: #c0392b; }
    .modal-pequeno p { color: #555; margin-bottom: 24px; }
    .modal-cabecera { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px 0; }
    .modal-cabecera h2 { margin: 0; color: #1B4F72; font-size: 20px; }
    .btn-cerrar { background: none; border: none; font-size: 18px; cursor: pointer; color: #888; }
    .modal-cuerpo { padding: 20px 24px; }
    .campo { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }
    .campo label { font-size: 13px; font-weight: 600; color: #555; }
    .campo input, .campo textarea { padding: 9px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; font-family: inherit; }
    .campo input:focus, .campo textarea:focus { outline: none; border-color: #1B4F72; }
    .fila-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .modal-pie { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; border-top: 1px solid #eee; }
    .btn-cancelar { padding: 9px 20px; background: #f0f0f0; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; }
    .btn-guardar { padding: 9px 20px; background: #1B4F72; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; }
    .btn-guardar:disabled { background: #aaa; cursor: not-allowed; }
    .btn-eliminar-confirm { padding: 9px 20px; background: #c0392b; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; }
    .cargando { text-align: center; padding: 60px; color: #666; }
    .spinner { width: 36px; height: 36px; border: 4px solid #f0f0f0; border-top-color: #1B4F72; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AdminComponent implements OnInit {

  tab: 'viajes' | 'reservas' = 'viajes';

  // Viajes
  viajes: Viaje[] = [];
  cargando = true;
  mensaje = '';
  esError = false;
  mostrarFormulario = false;
  mostrarConfirmacion = false;
  guardando = false;
  viajeEditando: Viaje | null = null;
  viajeAEliminar: Viaje | null = null;
  form: Partial<Viaje> = {};

  // Reservas
  reservas: ReservaResponse[] = [];
  reservasFiltradas: ReservaResponse[] = [];
  filtroEstado = '';

  constructor(
    private viajesService: ViajesService,
    private authService: AuthService,
    private reservaService: ReservaService
  ) {}

  ngOnInit(): void {
    this.cargarTodos();
    this.cargarReservas();
  }

  // ===== VIAJES =====

  cargarTodos(): void {
    this.cargando = true;
    this.viajesService.getTodosLosViajes().subscribe({
      next: (viajes) => { this.viajes = viajes; this.cargando = false; },
      error: () => { this.mostrarMensaje('Error al cargar los viajes.', true); this.cargando = false; }
    });
  }

  abrirFormulario(viaje: Viaje | null): void {
    this.viajeEditando = viaje;
    this.form = viaje ? { ...viaje } : {};
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.viajeEditando = null;
    this.form = {};
  }

  guardar(): void {
    if (!this.form.titulo || !this.form.destino || !this.form.pais || !this.form.precio) {
      this.mostrarMensaje('Los campos Título, Destino, País y Precio son obligatorios.', true);
      return;
    }
    this.guardando = true;
    const accion = this.viajeEditando?.id
      ? this.viajesService.actualizarViaje(this.viajeEditando.id, this.form as Viaje)
      : this.viajesService.crearViaje(this.form as Viaje);

    accion.subscribe({
      next: () => {
        this.mostrarMensaje(this.viajeEditando?.id ? 'Viaje actualizado.' : 'Viaje creado.');
        this.cerrarFormulario();
        this.cargarTodos();
        this.guardando = false;
      },
      error: () => { this.mostrarMensaje('Error al guardar el viaje.', true); this.guardando = false; }
    });
  }

  toggleActivo(viaje: Viaje): void {
    if (viaje.activo) {
      this.viajesService.desactivarViaje(viaje.id!).subscribe({
        next: () => { this.mostrarMensaje(`"${viaje.titulo}" desactivado.`); this.cargarTodos(); },
        error: () => this.mostrarMensaje('Error al desactivar.', true)
      });
    } else {
      this.viajesService.actualizarViaje(viaje.id!, { ...viaje, activo: true } as Viaje).subscribe({
        next: () => { this.mostrarMensaje(`"${viaje.titulo}" reactivado.`); this.cargarTodos(); },
        error: () => this.mostrarMensaje('Error al reactivar.', true)
      });
    }
  }

  confirmarEliminar(viaje: Viaje): void {
    this.viajeAEliminar = viaje;
    this.mostrarConfirmacion = true;
  }

  eliminar(): void {
    if (!this.viajeAEliminar?.id) return;
    this.viajesService.eliminarViaje(this.viajeAEliminar.id).subscribe({
      next: () => {
        this.mostrarMensaje(`"${this.viajeAEliminar?.titulo}" eliminado.`);
        this.mostrarConfirmacion = false;
        this.viajeAEliminar = null;
        this.cargarTodos();
      },
      error: () => { this.mostrarMensaje('Error al eliminar.', true); this.mostrarConfirmacion = false; }
    });
  }

  // ===== RESERVAS =====

  cargarReservas(): void {
    // Solo mostramos spinner si estamos en la pestaña de reservas
    if (this.tab === 'reservas') this.cargando = true;
    this.reservaService.getTodasLasReservas().subscribe({
      next: (lista) => {
        this.reservas = lista;
        this.filtrarReservas();
        if (this.tab === 'reservas') this.cargando = false;
      },
      error: () => { this.mostrarMensaje('Error al cargar las reservas.', true); this.cargando = false; }
    });
  }

  filtrarReservas(): void {
    this.reservasFiltradas = this.filtroEstado
      ? this.reservas.filter(r => r.estado === this.filtroEstado)
      : [...this.reservas];
  }

  confirmarReserva(r: ReservaResponse): void {
    this.reservaService.confirmarReserva(r.id).subscribe({
      next: (actualizada) => {
        r.estado = actualizada.estado;
        this.mostrarMensaje(`Reserva #${r.id} confirmada.`);
      },
      error: () => this.mostrarMensaje('Error al confirmar la reserva.', true)
    });
  }

  cancelarReserva(r: ReservaResponse): void {
    this.reservaService.cancelarReserva(r.id).subscribe({
      next: (actualizada) => {
        r.estado = actualizada.estado;
        this.mostrarMensaje(`Reserva #${r.id} cancelada.`);
      },
      error: () => this.mostrarMensaje('Error al cancelar la reserva.', true)
    });
  }

  private mostrarMensaje(texto: string, error = false): void {
    this.mensaje = texto;
    this.esError = error;
    setTimeout(() => this.mensaje = '', 4000);
  }
}