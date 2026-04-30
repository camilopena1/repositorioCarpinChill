import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ViajesService } from '../../services/viajes.service';
import { ClienteService } from '../../services/cliente.service';
import { ReservaService } from '../../services/reserva.service';
import { AuthService } from '../../services/auth.service';
import { Viaje } from '../../models/viaje.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="admin-pagina">
      <div class="admin-cab">
        <h1>⚙️ Panel de administración</h1>
      </div>

      <!-- Pestañas -->
      <div class="pestanas">
        <button [class.activa]="tab==='stats'" (click)="tab='stats'; cargarStats()">📊 Resumen</button>
        <button [class.activa]="tab==='viajes'" (click)="tab='viajes'; cargarViajes()">🗺️ Viajes</button>
        <button [class.activa]="tab==='clientes'" (click)="tab='clientes'; cargarClientes()">👥 Clientes</button>
        <button [class.activa]="tab==='reservas'" (click)="tab='reservas'; cargarReservas()">📋 Reservas</button>
      </div>

      <div *ngIf="msg" class="msg" [class.error]="esError">{{ msg }}</div>

      <!-- ══ ESTADÍSTICAS ══ -->
      <div *ngIf="tab==='stats'">
        <div *ngIf="!stats" class="cargando"><div class="spinner"></div></div>
        <div *ngIf="stats" class="stats-grid">
          <div class="stat-card azul">
            <span class="stat-num">{{ stats.viajesActivos }}</span>
            <span class="stat-lbl">Viajes activos</span>
          </div>
          <div class="stat-card verde">
            <span class="stat-num">{{ stats.reservasConfirmadas }}</span>
            <span class="stat-lbl">Reservas confirmadas</span>
          </div>
          <div class="stat-card naranja">
            <span class="stat-num">{{ stats.reservasPendientes }}</span>
            <span class="stat-lbl">Reservas pendientes</span>
          </div>
          <div class="stat-card morado">
            <span class="stat-num">{{ stats.totalUsuarios }}</span>
            <span class="stat-lbl">Usuarios registrados</span>
          </div>
          <div class="stat-card grande">
            <span class="stat-num">{{ stats.ingresosTotales | currency:'EUR':'symbol':'1.0-0' }}</span>
            <span class="stat-lbl">Ingresos totales (confirmados)</span>
          </div>
          <div class="stat-card gris">
            <span class="stat-num">{{ stats.totalReservas }}</span>
            <span class="stat-lbl">Total reservas</span>
          </div>
        </div>
      </div>

      <!-- ══ VIAJES ══ -->
      <div *ngIf="tab==='viajes'">
        <div class="sec-cab">
          <span>{{ viajes.length }} viajes</span>
          <button class="btn-nuevo" (click)="abrirFormViaje(null)">+ Nuevo viaje</button>
        </div>
        <div *ngIf="cargandoV" class="cargando"><div class="spinner"></div></div>
        <div *ngIf="!cargandoV" class="tabla-wrap">
          <table class="tabla">
            <thead><tr><th>ID</th><th>Título</th><th>Destino</th><th>País</th><th>Precio</th><th>Plazas</th><th>⭐</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              <tr *ngFor="let v of viajes" [class.inactivo]="!v.activo">
                <td>{{ v.id }}</td>
                <td><a [routerLink]="['/viajes', v.id]" class="link">{{ v.titulo }}</a></td>
                <td>{{ v.destino }}</td><td>{{ v.pais }}</td>
                <td>{{ v.precio | currency:'EUR':'symbol':'1.0-0' }}</td>
                <td [class.pocas]="v.plazasDisponibles <= 5">{{ v.plazasDisponibles }}/{{ v.plazasTotales }}</td>
                <td>{{ v.valoracionMedia || '-' }}</td>
                <td><span class="badge" [class.act]="v.activo">{{ v.activo ? 'Activo' : 'Inactivo' }}</span></td>
                <td class="acc">
                  <button (click)="abrirFormViaje(v)" title="Editar">✏️</button>
                  <button (click)="toggleViaje(v)">{{ v.activo ? '🚫' : '✅' }}</button>
                  <button (click)="pedirEliminar(() => eliminarViaje(v))">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ══ CLIENTES ══ -->
      <div *ngIf="tab==='clientes'">
        <div class="sec-cab">
          <input [(ngModel)]="busqCliente" (input)="filtrarClientes()" placeholder="Buscar..." class="buscador"/>
          <span>{{ clientesFiltrados.length }} clientes</span>
        </div>
        <div *ngIf="cargandoC" class="cargando"><div class="spinner"></div></div>
        <div *ngIf="!cargandoC" class="tabla-wrap">
          <table class="tabla">
            <thead><tr><th>ID</th><th>Nombre</th><th>Email</th><th>Teléfono</th><th>DNI</th><th>Acciones</th></tr></thead>
            <tbody>
              <tr *ngFor="let c of clientesFiltrados">
                <td>{{ c.id }}</td><td>{{ c.nombreCompleto }}</td>
                <td>{{ c.email }}</td><td>{{ c.telefono }}</td><td>{{ c.dni }}</td>
                <td class="acc">
                  <button (click)="pedirEliminar(() => eliminarCliente(c.id))">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ══ RESERVAS ══ -->
      <div *ngIf="tab==='reservas'">
        <div class="sec-cab">
          <div class="filtros-estado">
            <button [class.act-f]="filtroR==='TODOS'" (click)="filtroR='TODOS'">Todas</button>
            <button [class.act-f]="filtroR==='PENDIENTE'" (click)="filtroR='PENDIENTE'">Pendientes</button>
            <button [class.act-f]="filtroR==='CONFIRMADA'" (click)="filtroR='CONFIRMADA'">Confirmadas</button>
            <button [class.act-f]="filtroR==='CANCELADA'" (click)="filtroR='CANCELADA'">Canceladas</button>
          </div>
        </div>
        <div *ngIf="cargandoR" class="cargando"><div class="spinner"></div></div>
        <div *ngIf="!cargandoR" class="tabla-wrap">
          <table class="tabla">
            <thead><tr><th>ID</th><th>Cliente</th><th>Viaje</th><th>Fecha</th><th>Personas</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              <tr *ngFor="let r of reservasFiltradas()">
                <td>{{ r.id }}</td><td>{{ r.nombreUsuario }}</td><td>{{ r.tituloViaje }}</td>
                <td>{{ r.fechaReserva | date:'dd/MM/yy HH:mm' }}</td>
                <td>{{ r.numPersonas }}</td>
                <td>{{ r.precioTotal | currency:'EUR':'symbol':'1.0-0' }}</td>
                <td><span class="badge-r estado-{{ r.estado.toLowerCase() }}">{{ r.estado }}</span></td>
                <td class="acc">
                  <button *ngIf="r.estado==='PENDIENTE'" (click)="confirmarReserva(r.id)" title="Confirmar">✅</button>
                  <button *ngIf="r.estado!=='CANCELADA'" (click)="cancelarReserva(r.id)" title="Cancelar">❌</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal viaje -->
      <div *ngIf="showFormViaje" class="overlay" (click)="showFormViaje=false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-cab"><h2>{{ viajeEdit?.id ? 'Editar' : 'Nuevo' }} viaje</h2><button (click)="showFormViaje=false">✕</button></div>
          <div class="modal-body">
            <div class="campo"><label>Título *</label><input [(ngModel)]="fv.titulo"/></div>
            <div class="campo"><label>Descripción</label><textarea [(ngModel)]="fv.descripcion" rows="2"></textarea></div>
            <div class="fila2">
              <div class="campo"><label>Destino *</label><input [(ngModel)]="fv.destino"/></div>
              <div class="campo"><label>País *</label><input [(ngModel)]="fv.pais"/></div>
            </div>
            <div class="fila2">
              <div class="campo"><label>Latitud</label><input type="number" [(ngModel)]="fv.latitud"/></div>
              <div class="campo"><label>Longitud</label><input type="number" [(ngModel)]="fv.longitud"/></div>
            </div>
            <div class="fila2">
              <div class="campo"><label>Precio (€) *</label><input type="number" [(ngModel)]="fv.precio"/></div>
              <div class="campo"><label>Plazas</label><input type="number" [(ngModel)]="fv.plazasTotales"/></div>
            </div>
            <div class="fila2">
              <div class="campo"><label>Fecha inicio</label><input type="date" [(ngModel)]="fv.fechaInicio"/></div>
              <div class="campo"><label>Fecha fin</label><input type="date" [(ngModel)]="fv.fechaFin"/></div>
            </div>
            <div class="campo"><label>URL imagen</label><input [(ngModel)]="fv.imagenUrl"/></div>
          </div>
          <div class="modal-pie">
            <button class="btn-can" (click)="showFormViaje=false">Cancelar</button>
            <button class="btn-gua" (click)="guardarViaje()" [disabled]="guardando">{{ guardando ? '...' : 'Guardar' }}</button>
          </div>
        </div>
      </div>

      <!-- Modal confirmación -->
      <div *ngIf="showConfirm" class="overlay">
        <div class="modal modal-sm">
          <h2>¿Eliminar?</h2><p>Esta acción no se puede deshacer.</p>
          <div class="modal-pie">
            <button class="btn-can" (click)="showConfirm=false">Cancelar</button>
            <button class="btn-del" (click)="accionEliminar && accionEliminar(); showConfirm=false">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-pagina{padding:16px 0}
    .admin-cab h1{font-size:22px;color:#1B4F72;margin:0 0 16px}
    .pestanas{display:flex;gap:6px;margin-bottom:20px;border-bottom:2px solid #e0e0e0;padding-bottom:0}
    .pestanas button{background:none;border:none;padding:10px 18px;font-size:14px;cursor:pointer;color:#666;border-bottom:3px solid transparent;margin-bottom:-2px}
    .pestanas button.activa{color:#1B4F72;font-weight:600;border-bottom-color:#1B4F72}
    .msg{padding:10px 14px;border-radius:8px;margin-bottom:14px;background:#d5f5e3;color:#1e8449;font-size:13px}
    .msg.error{background:#fdecea;color:#c0392b}
    .sec-cab{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;gap:12px}
    .buscador{padding:7px 12px;border:1px solid #ddd;border-radius:7px;font-size:13px;width:220px}
    .btn-nuevo{background:#1B4F72;color:white;border:none;padding:8px 16px;border-radius:7px;cursor:pointer;font-size:13px;font-weight:600}
    .filtros-estado{display:flex;gap:6px}
    .filtros-estado button{background:#f0f0f0;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px}
    .filtros-estado button.act-f{background:#1B4F72;color:white}
    .stats-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;margin-top:8px}
    .stat-card{background:white;border-radius:12px;padding:20px;display:flex;flex-direction:column;gap:6px;box-shadow:0 2px 8px rgba(0,0,0,0.07)}
    .stat-card.grande{grid-column:span 2}
    .stat-num{font-size:28px;font-weight:bold}
    .stat-lbl{font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.4px}
    .stat-card.azul .stat-num{color:#1B4F72}
    .stat-card.verde .stat-num{color:#1e8449}
    .stat-card.naranja .stat-num{color:#d68910}
    .stat-card.morado .stat-num{color:#7d3c98}
    .stat-card.gris .stat-num{color:#555}
    .tabla-wrap{overflow-x:auto}
    .tabla{width:100%;border-collapse:collapse;background:white;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
    .tabla th{background:#1B4F72;color:white;padding:9px 11px;text-align:left;font-size:12px}
    .tabla td{padding:9px 11px;border-bottom:1px solid #f0f0f0;font-size:12px}
    .tabla tr.inactivo td{opacity:.5}
    .link{color:#1B4F72;text-decoration:none}
    .pocas{color:#e74c3c;font-weight:600}
    .badge{padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;background:#f0f0f0;color:#888}
    .badge.act{background:#d5f5e3;color:#1e8449}
    .badge-r{padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600}
    .estado-pendiente{background:#fff3cd;color:#856404}
    .estado-confirmada{background:#d5f5e3;color:#1e8449}
    .estado-cancelada{background:#f8d7da;color:#842029}
    .acc{display:flex;gap:4px}
    .acc button{background:none;border:1px solid #ddd;border-radius:5px;padding:3px 6px;cursor:pointer;font-size:13px}
    .acc button:hover{background:#f0f0f0}
    .overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:1000}
    .modal{background:white;border-radius:14px;width:100%;max-width:540px;max-height:90vh;overflow-y:auto}
    .modal-sm{max-width:360px;padding:22px}
    .modal-sm h2{color:#c0392b;margin:0 0 8px}
    .modal-sm p{color:#555;margin:0 0 20px}
    .modal-cab{display:flex;justify-content:space-between;align-items:center;padding:16px 20px 0}
    .modal-cab h2{margin:0;color:#1B4F72;font-size:17px}
    .modal-cab button{background:none;border:none;font-size:16px;cursor:pointer;color:#888}
    .modal-body{padding:14px 20px}
    .campo{display:flex;flex-direction:column;gap:4px;margin-bottom:10px}
    .campo label{font-size:11px;font-weight:600;color:#555}
    .campo input,.campo textarea{padding:7px 10px;border:1px solid #ddd;border-radius:6px;font-size:13px}
    .campo input:focus,.campo textarea:focus{outline:none;border-color:#1B4F72}
    .fila2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .modal-pie{display:flex;justify-content:flex-end;gap:10px;padding:12px 20px;border-top:1px solid #eee}
    .btn-can{padding:7px 16px;background:#f0f0f0;border:none;border-radius:7px;cursor:pointer}
    .btn-gua{padding:7px 16px;background:#1B4F72;color:white;border:none;border-radius:7px;cursor:pointer;font-weight:600}
    .btn-gua:disabled{background:#aaa;cursor:not-allowed}
    .btn-del{padding:7px 16px;background:#c0392b;color:white;border:none;border-radius:7px;cursor:pointer;font-weight:600}
    .cargando{text-align:center;padding:40px}
    .spinner{width:30px;height:30px;border:4px solid #f0f0f0;border-top-color:#1B4F72;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto}
    @keyframes spin{to{transform:rotate(360deg)}}
  `]
})
export class AdminComponent implements OnInit {

  tab = 'stats';
  msg = ''; esError = false;

  // Stats
  stats: any = null;

  // Viajes
  viajes: Viaje[] = []; cargandoV = false;
  showFormViaje = false; viajeEdit: Viaje | null = null;
  fv: Partial<Viaje> = {}; guardando = false;

  // Clientes
  clientes: any[] = []; clientesFiltrados: any[] = [];
  busqCliente = ''; cargandoC = false;

  // Reservas
  reservas: any[] = []; cargandoR = false; filtroR = 'TODOS';

  // Confirmación
  showConfirm = false; accionEliminar: (() => void) | null = null;

  constructor(
    private viajesService: ViajesService,
    private clienteService: ClienteService,
    private reservaService: ReservaService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void { this.cargarStats(); }

  cargarStats(): void {
    this.http.get<any>(`${environment.apiUrl}/stats`, {
      headers: { Authorization: `Bearer ${this.authService.getToken() || ''}` }
    }).subscribe({ next: s => this.stats = s, error: () => {} });
  }

  cargarViajes(): void {
    this.cargandoV = true;
    this.viajesService.getTodosLosViajes().subscribe({
      next: v => { this.viajes = v; this.cargandoV = false; },
      error: () => { this.mostrarMsg('Error al cargar viajes.', true); this.cargandoV = false; }
    });
  }

  abrirFormViaje(v: Viaje | null): void {
    this.viajeEdit = v; this.fv = v ? { ...v } : {}; this.showFormViaje = true;
  }

  guardarViaje(): void {
    if (!this.fv.titulo || !this.fv.destino || !this.fv.pais || !this.fv.precio) {
      this.mostrarMsg('Título, Destino, País y Precio son obligatorios.', true); return;
    }
    this.guardando = true;
    const obs = this.viajeEdit?.id
      ? this.viajesService.actualizarViaje(this.viajeEdit.id, this.fv as Viaje)
      : this.viajesService.crearViaje(this.fv as Viaje);
    obs.subscribe({
      next: () => { this.mostrarMsg('Guardado.'); this.showFormViaje = false; this.cargarViajes(); this.guardando = false; },
      error: () => { this.mostrarMsg('Error al guardar.', true); this.guardando = false; }
    });
  }

  toggleViaje(v: Viaje): void {
    const obs = v.activo
      ? this.viajesService.desactivarViaje(v.id!)
      : this.viajesService.actualizarViaje(v.id!, { ...v, activo: true } as Viaje);
    obs.subscribe({
      next: () => { this.mostrarMsg('Estado actualizado.'); this.cargarViajes(); },
      error: () => this.mostrarMsg('Error.', true)
    });
  }

  eliminarViaje(v: Viaje): void {
    this.viajesService.eliminarViaje(v.id!).subscribe({
      next: () => { this.mostrarMsg('Viaje eliminado.'); this.cargarViajes(); },
      error: () => this.mostrarMsg('Error.', true)
    });
  }

  cargarClientes(): void {
    this.cargandoC = true;
    this.clienteService.getClientes().subscribe({
      next: c => { this.clientes = c; this.clientesFiltrados = c; this.cargandoC = false; },
      error: () => { this.cargandoC = false; }
    });
  }

  filtrarClientes(): void {
    const q = this.busqCliente.toLowerCase();
    this.clientesFiltrados = this.clientes.filter(c =>
      c.nombreCompleto?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
    );
  }

  eliminarCliente(id: number): void {
    this.clienteService.eliminar(id).subscribe({
      next: () => { this.mostrarMsg('Cliente eliminado.'); this.cargarClientes(); },
      error: () => this.mostrarMsg('Error.', true)
    });
  }

  cargarReservas(): void {
    this.cargandoR = true;
    this.reservaService.getTodasLasReservas().subscribe({
      next: r => { this.reservas = r; this.cargandoR = false; },
      error: () => { this.cargandoR = false; }
    });
  }

  reservasFiltradas(): any[] {
    return this.filtroR === 'TODOS' ? this.reservas : this.reservas.filter(r => r.estado === this.filtroR);
  }

  confirmarReserva(id: number): void {
    this.reservaService.confirmarReserva(id).subscribe({
      next: () => { this.mostrarMsg('Reserva confirmada. Se enviará email al cliente.'); this.cargarReservas(); },
      error: () => this.mostrarMsg('Error.', true)
    });
  }

  cancelarReserva(id: number): void {
    this.reservaService.cancelarReserva(id).subscribe({
      next: () => { this.mostrarMsg('Reserva cancelada.'); this.cargarReservas(); },
      error: () => this.mostrarMsg('Error.', true)
    });
  }

  pedirEliminar(accion: () => void): void {
    this.accionEliminar = accion; this.showConfirm = true;
  }

  private mostrarMsg(t: string, e = false): void {
    this.msg = t; this.esError = e; setTimeout(() => this.msg = '', 4000);
  }
}
