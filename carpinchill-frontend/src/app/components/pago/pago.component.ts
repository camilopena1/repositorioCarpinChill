import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PagoService } from '../../services/pago.service';
import { ReservaService, ReservaResponse } from '../../services/reserva.service';

@Component({
  selector: 'app-pago',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="pago-pagina">
      <div class="pago-card">

        <!-- Cabecera -->
        <div class="pago-header">
          <div class="pago-logo">💳</div>
          <h1>Pago seguro simulado</h1>
          <p class="pago-subtitulo">Introduce los datos de tu tarjeta para confirmar la reserva</p>
        </div>

        <!-- Resumen de la reserva -->
        <div class="resumen-reserva" *ngIf="reserva">
          <div class="resumen-fila">
            <span>Viaje</span>
            <span><strong>{{ reserva.tituloViaje }}</strong></span>
          </div>
          <div class="resumen-fila">
            <span>Personas</span>
            <span>{{ reserva.numPersonas }}</span>
          </div>
          <div class="resumen-fila total">
            <span>Total a pagar</span>
            <span class="precio-total">{{ reserva.precioTotal | currency:'EUR':'symbol':'1.0-0' }}</span>
          </div>
        </div>

        <!-- Mensaje resultado -->
        <div *ngIf="resultado" class="resultado" [class.exito]="pagoExitoso" [class.error]="!pagoExitoso">
          <div class="resultado-icono">{{ pagoExitoso ? '✅' : '❌' }}</div>
          <p>{{ resultado }}</p>
          <div *ngIf="pagoExitoso" class="resultado-acciones">
            <a routerLink="/mis-reservas" class="btn-ver-reservas">Ver mis reservas →</a>
          </div>
          <div *ngIf="!pagoExitoso" class="resultado-acciones">
            <button (click)="resultado = ''" class="btn-reintentar">Reintentar pago</button>
          </div>
        </div>

        <!-- Formulario de tarjeta -->
        <form *ngIf="!pagoExitoso" (ngSubmit)="pagar()" class="form-tarjeta">

          <!-- Tarjeta visual -->
          <div class="tarjeta-visual" [class.flip]="mostrarReverso">
            <div class="tarjeta-frente">
              <div class="tarjeta-chip">▬▬</div>
              <div class="tarjeta-numero">{{ formatearNumero() }}</div>
              <div class="tarjeta-info">
                <div>
                  <div class="tarjeta-label">Titular</div>
                  <div class="tarjeta-valor">{{ nombreTitular || 'NOMBRE APELLIDO' }}</div>
                </div>
                <div>
                  <div class="tarjeta-label">Caduca</div>
                  <div class="tarjeta-valor">{{ fechaExpiracion || 'MM/AA' }}</div>
                </div>
              </div>
            </div>
            <div class="tarjeta-reverso">
              <div class="tarjeta-banda"></div>
              <div class="tarjeta-cvv-zona">
                <span class="tarjeta-label">CVV</span>
                <span class="tarjeta-cvv-valor">{{ cvv ? '•'.repeat(cvv.length) : '•••' }}</span>
              </div>
            </div>
          </div>

          <!-- Campos -->
          <div class="campo-grupo">
            <label>Número de tarjeta</label>
            <input
              type="text"
              [(ngModel)]="numeroTarjeta"
              name="numeroTarjeta"
              placeholder="1234 5678 9012 3456"
              maxlength="19"
              (input)="formatearInput($event)"
              required
            />
            <span class="campo-ayuda">Termina en 0000 o 9999 para simular rechazo</span>
          </div>

          <div class="campo-grupo">
            <label>Nombre del titular</label>
            <input
              type="text"
              [(ngModel)]="nombreTitular"
              name="nombreTitular"
              placeholder="NOMBRE APELLIDO"
              maxlength="100"
              (input)="nombreTitular = $any($event.target).value.toUpperCase()"
              required
            />
          </div>

          <div class="campo-grupo doble">
            <div class="campo">
              <label>Fecha de caducidad</label>
              <input
                type="text"
                [(ngModel)]="fechaExpiracion"
                name="fechaExpiracion"
                placeholder="MM/AA"
                maxlength="5"
                (input)="formatearFecha($event)"
                required
              />
            </div>
            <div class="campo">
              <label>CVV</label>
              <input
                type="text"
                [(ngModel)]="cvv"
                name="cvv"
                placeholder="123"
                maxlength="3"
                (focus)="mostrarReverso = true"
                (blur)="mostrarReverso = false"
                required
              />
            </div>
          </div>

          <div class="seguridad-info">
            🔒 Conexión segura simulada · Los datos no se almacenan · Solo para demostración
          </div>

          <button type="submit" class="btn-pagar" [disabled]="procesando || !formularioValido()">
            <span *ngIf="!procesando">
              Pagar {{ reserva?.precioTotal | currency:'EUR':'symbol':'1.0-0' }}
            </span>
            <span *ngIf="procesando">
              <span class="spinner-inline"></span> Procesando...
            </span>
          </button>

        </form>

        <a routerLink="/mis-reservas" class="btn-cancelar-pago">Cancelar y volver a mis reservas</a>

      </div>
    </div>
  `,
  styles: [`
    .pago-pagina {
      display: flex; justify-content: center; align-items: flex-start;
      padding: 32px 16px; min-height: calc(100vh - 60px); background: var(--bg-app, #f0f4f8);
    }
    .pago-card {
      background: var(--bg-card, white); border-radius: 20px; width: 100%; max-width: 520px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.1); padding: 32px;
    }
    .pago-header { text-align: center; margin-bottom: 24px; }
    .pago-logo { font-size: 48px; margin-bottom: 8px; }
    .pago-header h1 { font-size: 22px; color: #1B4F72; margin: 0 0 6px; }
    .pago-subtitulo { color: var(--text-muted, #666); font-size: 14px; margin: 0; }

    /* Resumen */
    .resumen-reserva {
      background: var(--bg-muted, #f8f9fa); border-radius: 12px; padding: 16px;
      margin-bottom: 24px; border: 1px solid #e9ecef;
    }
    .resumen-fila {
      display: flex; justify-content: space-between;
      padding: 6px 0; font-size: 14px; color: var(--text-primary, #555);
      border-bottom: 1px solid #eee;
    }
    .resumen-fila:last-child { border-bottom: none; }
    .resumen-fila.total { font-size: 16px; font-weight: 700; color: #1B4F72; padding-top: 10px; }
    .precio-total { color: #1B4F72; font-size: 20px; }

    /* Tarjeta visual */
    .tarjeta-visual {
      width: 100%; height: 180px; perspective: 1000px;
      margin-bottom: 24px; position: relative;
    }
    .tarjeta-frente, .tarjeta-reverso {
      position: absolute; width: 100%; height: 100%;
      border-radius: 16px; backface-visibility: hidden;
      transition: transform 0.6s ease;
    }
    .tarjeta-frente {
      background: linear-gradient(135deg, #1B4F72, #2E86AB);
      color: white; padding: 20px; box-sizing: border-box;
      display: flex; flex-direction: column; justify-content: space-between;
    }
    .tarjeta-reverso {
      background: linear-gradient(135deg, #2c3e50, #3d5a73);
      transform: rotateY(180deg);
    }
    .tarjeta-visual.flip .tarjeta-frente { transform: rotateY(-180deg); }
    .tarjeta-visual.flip .tarjeta-reverso { transform: rotateY(0deg); }
    .tarjeta-chip { font-size: 20px; color: #FFD700; }
    .tarjeta-numero { font-size: 20px; letter-spacing: 3px; font-family: monospace; }
    .tarjeta-info { display: flex; gap: 32px; }
    .tarjeta-label { font-size: 10px; opacity: 0.7; text-transform: uppercase; }
    .tarjeta-valor { font-size: 14px; font-weight: 600; }
    .tarjeta-banda {
      background: #111; height: 40px; margin: 24px 0;
    }
    .tarjeta-cvv-zona {
      background: var(--bg-card, white); margin: 0 16px; padding: 8px 12px;
      border-radius: 4px; display: flex; justify-content: space-between; align-items: center;
    }
    .tarjeta-cvv-valor { font-family: monospace; font-size: 16px; color: var(--text-primary, #333); }

    /* Formulario */
    .form-tarjeta { display: flex; flex-direction: column; gap: 16px; }
    .campo-grupo { display: flex; flex-direction: column; gap: 5px; }
    .campo-grupo.doble { flex-direction: row; gap: 12px; }
    .campo-grupo.doble .campo { flex: 1; display: flex; flex-direction: column; gap: 5px; }
    label { font-size: 13px; font-weight: 600; color: var(--text-label, #555); }
    input {
      padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px;
      font-size: 15px; transition: border-color 0.2s; font-family: monospace;
    }
    input:focus { outline: none; border-color: #1B4F72; box-shadow: 0 0 0 3px rgba(27,79,114,0.1); }
    .campo-ayuda { font-size: 11px; color: var(--text-muted, #999); }
    .seguridad-info {
      text-align: center; font-size: 12px; color: var(--text-muted, #888);
      padding: 8px; background: var(--bg-muted, #f8f9fa); border-radius: 8px;
    }
    .btn-pagar {
      background: #27ae60; color: white; border: none;
      padding: 14px; border-radius: 10px; font-size: 16px; font-weight: 700;
      cursor: pointer; transition: background 0.2s; width: 100%;
    }
    .btn-pagar:hover:not(:disabled) { background: #229954; }
    .btn-pagar:disabled { opacity: 0.6; cursor: not-allowed; }
    .spinner-inline {
      display: inline-block; width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.4); border-top-color: white;
      border-radius: 50%; animation: spin 0.8s linear infinite; vertical-align: middle;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .btn-cancelar-pago {
      display: block; text-align: center; margin-top: 14px;
      color: var(--text-muted, #999); font-size: 13px; text-decoration: none;
    }
    .btn-cancelar-pago:hover { color: #555; }

    /* Resultado */
    .resultado {
      text-align: center; padding: 24px; border-radius: 12px; margin-bottom: 20px;
    }
    .resultado.exito { background: #e8f5e9; border: 2px solid #4CAF50; }
    .resultado.error { background: #fef3f3; border: 2px solid #e74c3c; }
    .resultado-icono { font-size: 40px; margin-bottom: 10px; }
    .resultado p { font-size: 15px; margin: 0 0 16px; color: var(--text-primary, #333); }
    .resultado-acciones { display: flex; justify-content: center; gap: 12px; }
    .btn-ver-reservas {
      background: #1B4F72; color: white; padding: 10px 20px;
      border-radius: 8px; text-decoration: none; font-weight: 600;
    }
    .btn-reintentar {
      background: #e74c3c; color: white; border: none;
      padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600;
    }
  `]
})
export class PagoComponent implements OnInit {

  reservaId: number | null = null;
  reserva: ReservaResponse | null = null;

  // Campos del formulario
  numeroTarjeta = '';
  nombreTitular = '';
  fechaExpiracion = '';
  cvv = '';
  mostrarReverso = false;

  procesando = false;
  resultado = '';
  pagoExitoso = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pagoService: PagoService,
    private reservaService: ReservaService
  ) {}

  ngOnInit(): void {
    this.reservaId = Number(this.route.snapshot.paramMap.get('reservaId'));
    if (this.reservaId) {
      this.reservaService.getMisReservas().subscribe({
        next: (reservas) => {
          this.reserva = reservas.find(r => r.id === this.reservaId) || null;
          if (!this.reserva) this.router.navigate(['/mis-reservas']);
        },
        error: () => this.router.navigate(['/mis-reservas'])
      });
    }
  }

  formatearNumero(): string {
    const limpio = this.numeroTarjeta.replace(/\s/g, '');
    const rellenado = limpio.padEnd(16, '•');
    return rellenado.match(/.{1,4}/g)?.join(' ') || '•••• •••• •••• ••••';
  }

  formatearInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '').substring(0, 16);
    this.numeroTarjeta = val.match(/.{1,4}/g)?.join(' ') || val;
    input.value = this.numeroTarjeta;
  }

  formatearFecha(event: Event): void {
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 3) val = val.substring(0, 2) + '/' + val.substring(2);
    this.fechaExpiracion = val;
    input.value = val;
  }

  formularioValido(): boolean {
    return this.numeroTarjeta.replace(/\s/g, '').length === 16
      && this.nombreTitular.trim().length >= 3
      && this.fechaExpiracion.length === 5
      && this.cvv.length === 3;
  }

  pagar(): void {
    if (!this.formularioValido() || !this.reservaId) return;
    this.procesando = true;
    this.resultado = '';

    this.pagoService.procesarPago({
      reservaId: this.reservaId,
      numeroTarjeta: this.numeroTarjeta.replace(/\s/g, ''),
      nombreTitular: this.nombreTitular,
      fechaExpiracion: this.fechaExpiracion,
      cvv: this.cvv
    }).subscribe({
      next: (res) => {
        this.procesando = false;
        this.pagoExitoso = res.exito;
        this.resultado = res.mensaje;
      },
      error: (err) => {
        this.procesando = false;
        this.pagoExitoso = false;
        this.resultado = err.error?.mensaje || err.error || 'Error al procesar el pago.';
      }
    });
  }
}