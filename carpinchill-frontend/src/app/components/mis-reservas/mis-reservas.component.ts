import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReservaService, ReservaResponse } from '../../services/reserva.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="pagina">
      <div class="cab"><h1>📋 Mis reservas</h1><p>Hola, <strong>{{ getNombre() }}</strong></p></div>
      <div *ngIf="cargando" class="cargando"><div class="spinner"></div></div>
      <div *ngIf="!cargando && reservas.length===0" class="vacio">
        <p>😊 No tienes reservas todavía.</p>
        <a routerLink="/viajes" class="btn-cat">Ver catálogo →</a>
      </div>
      <div *ngIf="!cargando && reservas.length>0" class="lista">
        <div *ngFor="let r of reservas" class="card">
          <div class="card-cab">
            <div><span class="rid">Reserva #{{ r.id }}</span><span class="badge estado-{{ r.estado.toLowerCase() }}">{{ r.estado }}</span></div>
            <span class="fecha">{{ r.fechaReserva | date:'dd/MM/yyyy' }}</span>
          </div>
          <div class="card-body">
            <div class="info"><span class="lbl">Viaje</span><span>{{ r.tituloViaje }}</span></div>
            <div class="info"><span class="lbl">Personas</span><span>{{ r.numPersonas }}</span></div>
            <div class="info"><span class="lbl">Total</span><span class="precio">{{ r.precioTotal | currency:'EUR':'symbol':'1.0-0' }}</span></div>
            <div class="info" *ngIf="r.notas"><span class="lbl">Notas</span><span>{{ r.notas }}</span></div>
          </div>
          <div class="card-pie">
            <a [routerLink]="['/viajes', r.viajeId]" class="btn-ver">Ver viaje</a>
            <button *ngIf="r.estado!=='CANCELADA'" class="btn-can" (click)="cancelar(r.id)" [disabled]="cancelando===r.id">
              {{ cancelando===r.id ? 'Cancelando...' : 'Cancelar reserva' }}
            </button>
          </div>
        </div>
      </div>
      <div *ngIf="msg" class="msg" [class.error]="esError">{{ msg }}</div>
    </div>
  `,
  styles: [`
    .pagina{padding:16px 0} .cab{margin-bottom:22px} .cab h1{font-size:22px;color:#1B4F72;margin:0 0 4px} .cab p{color:#666;margin:0}
    .cargando{text-align:center;padding:50px}
    .spinner{width:30px;height:30px;border:4px solid #f0f0f0;border-top-color:#1B4F72;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto}
    @keyframes spin{to{transform:rotate(360deg)}}
    .vacio{text-align:center;padding:50px;color:#666}
    .btn-cat{display:inline-block;background:#1B4F72;color:white;padding:9px 20px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:12px}
    .lista{display:flex;flex-direction:column;gap:14px}
    .card{background:white;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.07);overflow:hidden}
    .card-cab{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#f8f9fa;border-bottom:1px solid #f0f0f0}
    .rid{font-weight:600;color:#1B4F72;margin-right:10px;font-size:14px} .fecha{font-size:12px;color:#888}
    .badge{padding:2px 9px;border-radius:10px;font-size:11px;font-weight:600}
    .estado-pendiente{background:#fff3cd;color:#856404} .estado-confirmada{background:#d5f5e3;color:#1e8449} .estado-cancelada{background:#f8d7da;color:#842029}
    .card-body{padding:12px 16px;display:flex;flex-wrap:wrap;gap:14px}
    .info{display:flex;flex-direction:column;gap:2px} .lbl{font-size:10px;color:#888;font-weight:700;text-transform:uppercase}
    .precio{font-size:17px;font-weight:bold;color:#1B4F72}
    .card-pie{display:flex;gap:10px;padding:10px 16px;border-top:1px solid #f0f0f0}
    .btn-ver{display:inline-block;background:#1B4F72;color:white;padding:6px 14px;border-radius:7px;text-decoration:none;font-size:13px;font-weight:600}
    .btn-can{background:none;border:1px solid #c0392b;color:#c0392b;padding:6px 14px;border-radius:7px;cursor:pointer;font-size:13px}
    .btn-can:disabled{opacity:.5;cursor:not-allowed}
    .msg{padding:10px 14px;border-radius:8px;margin-top:14px;background:#d5f5e3;color:#1e8449;font-size:13px} .msg.error{background:#fdecea;color:#c0392b}
  `]
})
export class MisReservasComponent implements OnInit {
  reservas: ReservaResponse[] = []; cargando = true; cancelando: number | null = null;
  msg = ''; esError = false;

  constructor(private reservaService: ReservaService, private authService: AuthService) {}

  ngOnInit(): void {
    this.reservaService.getMisReservas().subscribe({
      next: r => { this.reservas = r; this.cargando = false; },
      error: () => { this.cargando = false; }
    });
  }

  getNombre(): string {
  return (this.authService.getUsuarioActual() as any)?.nombre || '';
}

  cancelar(id: number): void {
    this.cancelando = id;
    this.reservaService.cancelarReserva(id).subscribe({
      next: () => {
        const r = this.reservas.find(x => x.id === id);
        if (r) r.estado = 'CANCELADA';
        this.cancelando = null;
        this.mostrarMsg('Reserva cancelada correctamente.');
      },
      error: () => { this.cancelando = null; this.mostrarMsg('Error al cancelar.', true); }
    });
  }

  private mostrarMsg(t: string, e = false): void {
    this.msg = t; this.esError = e; setTimeout(() => this.msg = '', 4000);
  }
}
