import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ViajesService } from '../../services/viajes.service';
import { AuthService } from '../../services/auth.service';
import { Viaje } from '../../models/viaje.model';

/**
 * Panel de administración — Gestión de viajes.
 *
 * Funcionalidades (RF-05):
 *   - Listar TODOS los viajes (activos e inactivos) → GET /api/viajes/todos
 *   - Crear un nuevo viaje → POST /api/viajes
 *   - Editar un viaje existente → PUT /api/viajes/{id}
 *   - Desactivar un viaje (baja lógica) → PATCH /api/viajes/{id}/desactivar
 *   - Eliminar un viaje (baja física) → DELETE /api/viajes/{id}
 *
 * Solo accesible para usuarios con rol ADMIN o AGENTE.
 * Rama: feature/panel-admin
 */
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="admin-pagina">

      <!-- Cabecera -->
      <div class="admin-cabecera">
        <div>
          <h1>⚙️ Panel de administración</h1>
          <p>Gestión de viajes · {{ viajes.length }} registros</p>
        </div>
        <button class="btn-nuevo" (click)="abrirFormulario(null)">+ Nuevo viaje</button>
      </div>

      <!-- Mensaje de éxito / error -->
      <div *ngIf="mensaje" class="mensaje" [class.error]="esError">
        {{ mensaje }}
      </div>

      <!-- Estado de carga -->
      <div *ngIf="cargando" class="cargando">
        <div class="spinner"></div>
        <p>Cargando viajes...</p>
      </div>

      <!-- Tabla de viajes -->
      <div *ngIf="!cargando" class="tabla-contenedor">
        <table class="tabla-admin">
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Destino</th>
              <th>País</th>
              <th>Precio</th>
              <th>Plazas</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let viaje of viajes" [class.inactivo]="!viaje.activo">
              <td>{{ viaje.id }}</td>
              <td>
                <a [routerLink]="['/viajes', viaje.id]" class="link-titulo">
                  {{ viaje.titulo }}
                </a>
              </td>
              <td>{{ viaje.destino }}</td>
              <td>{{ viaje.pais }}</td>
              <td>{{ viaje.precio | currency:'EUR':'symbol':'1.0-0' }}</td>
              <td>
                <span [class.pocas]="viaje.plazasDisponibles <= 5">
                  {{ viaje.plazasDisponibles }}/{{ viaje.plazasTotales }}
                </span>
              </td>
              <td>
                <span class="badge" [class.badge-activo]="viaje.activo" [class.badge-inactivo]="!viaje.activo">
                  {{ viaje.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="acciones">
                <button class="btn-editar" (click)="abrirFormulario(viaje)" title="Editar">✏️</button>
                <button
                  class="btn-desactivar"
                  (click)="toggleActivo(viaje)"
                  [title]="viaje.activo ? 'Desactivar' : 'Activar'">
                  {{ viaje.activo ? '🚫' : '✅' }}
                </button>
                <button class="btn-eliminar" (click)="confirmarEliminar(viaje)" title="Eliminar">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal de formulario (crear/editar) -->
      <div *ngIf="mostrarFormulario" class="modal-overlay" (click)="cerrarFormulario()">
        <div class="modal" (click)="$event.stopPropagation()">

          <div class="modal-cabecera">
            <h2>{{ viajeEditando?.id ? 'Editar viaje' : 'Nuevo viaje' }}</h2>
            <button class="btn-cerrar" (click)="cerrarFormulario()">✕</button>
          </div>

          <div class="modal-cuerpo">
            <div class="campo">
              <label>Título *</label>
              <input [(ngModel)]="form.titulo" placeholder="Ej: Escapada a París" />
            </div>
            <div class="campo">
              <label>Descripción</label>
              <textarea [(ngModel)]="form.descripcion" rows="3" placeholder="Descripción del viaje..."></textarea>
            </div>
            <div class="fila-2">
              <div class="campo">
                <label>Destino *</label>
                <input [(ngModel)]="form.destino" placeholder="Ej: París" />
              </div>
              <div class="campo">
                <label>País *</label>
                <input [(ngModel)]="form.pais" placeholder="Ej: Francia" />
              </div>
            </div>
            <div class="fila-2">
              <div class="campo">
                <label>Latitud</label>
                <input type="number" [(ngModel)]="form.latitud" placeholder="Ej: 48.8566" />
              </div>
              <div class="campo">
                <label>Longitud</label>
                <input type="number" [(ngModel)]="form.longitud" placeholder="Ej: 2.3522" />
              </div>
            </div>
            <div class="fila-2">
              <div class="campo">
                <label>Precio (€) *</label>
                <input type="number" [(ngModel)]="form.precio" placeholder="Ej: 899" />
              </div>
              <div class="campo">
                <label>Plazas totales</label>
                <input type="number" [(ngModel)]="form.plazasTotales" placeholder="Ej: 20" />
              </div>
            </div>
            <div class="fila-2">
              <div class="campo">
                <label>Fecha inicio</label>
                <input type="date" [(ngModel)]="form.fechaInicio" />
              </div>
              <div class="campo">
                <label>Fecha fin</label>
                <input type="date" [(ngModel)]="form.fechaFin" />
              </div>
            </div>
            <div class="campo">
              <label>URL imagen</label>
              <input [(ngModel)]="form.imagenUrl" placeholder="https://..." />
            </div>
          </div>

          <div class="modal-pie">
            <button class="btn-cancelar" (click)="cerrarFormulario()">Cancelar</button>
            <button class="btn-guardar" (click)="guardar()" [disabled]="guardando">
              {{ guardando ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>

        </div>
      </div>

      <!-- Modal de confirmación de eliminar -->
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

    .admin-cabecera {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .admin-cabecera h1 { font-size: 26px; color: #1B4F72; margin: 0 0 4px; }
    .admin-cabecera p { color: #888; margin: 0; font-size: 14px; }

    .btn-nuevo {
      background: #1B4F72;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 10px;
      cursor: pointer;
      font-size: 15px;
      font-weight: 600;
    }
    .btn-nuevo:hover { background: #154360; }

    .mensaje {
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      background: #d5f5e3;
      color: #1e8449;
      font-size: 14px;
    }
    .mensaje.error { background: #fdecea; color: #c0392b; }

    .tabla-contenedor { overflow-x: auto; }

    .tabla-admin {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0,0,0,0.07);
    }
    .tabla-admin th {
      background: #1B4F72;
      color: white;
      padding: 12px 14px;
      text-align: left;
      font-size: 13px;
      font-weight: 600;
    }
    .tabla-admin td {
      padding: 12px 14px;
      border-bottom: 1px solid #f0f0f0;
      font-size: 14px;
      color: #333;
    }
    .tabla-admin tr:last-child td { border-bottom: none; }
    .tabla-admin tr.inactivo td { opacity: 0.5; }
    .tabla-admin tr:hover td { background: #f8f9fa; }

    .link-titulo { color: #1B4F72; text-decoration: none; font-weight: 500; }
    .link-titulo:hover { text-decoration: underline; }

    .pocas { color: #e74c3c; font-weight: 600; }

    .badge {
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-activo { background: #d5f5e3; color: #1e8449; }
    .badge-inactivo { background: #f0f0f0; color: #888; }

    .acciones { display: flex; gap: 6px; }
    .acciones button {
      background: none;
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 4px 8px;
      cursor: pointer;
      font-size: 15px;
      transition: background 0.15s;
    }
    .acciones button:hover { background: #f0f0f0; }

    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    }
    .modal-pequeno { max-width: 420px; padding: 28px; }
    .modal-pequeno h2 { margin: 0 0 12px; color: #c0392b; }
    .modal-pequeno p { color: #555; margin-bottom: 24px; }

    .modal-cabecera {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px 0;
    }
    .modal-cabecera h2 { margin: 0; color: #1B4F72; font-size: 20px; }
    .btn-cerrar {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: #888;
    }

    .modal-cuerpo { padding: 20px 24px; }

    .campo {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin-bottom: 14px;
    }
    .campo label { font-size: 13px; font-weight: 600; color: #555; }
    .campo input, .campo textarea {
      padding: 9px 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
    }
    .campo input:focus, .campo textarea:focus {
      outline: none;
      border-color: #1B4F72;
    }
    .fila-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    .modal-pie {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid #eee;
    }
    .btn-cancelar {
      padding: 9px 20px;
      background: #f0f0f0;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
    }
    .btn-guardar {
      padding: 9px 20px;
      background: #1B4F72;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
    }
    .btn-guardar:disabled { background: #aaa; cursor: not-allowed; }
    .btn-eliminar-confirm {
      padding: 9px 20px;
      background: #c0392b;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
    }

    .cargando { text-align: center; padding: 60px; color: #666; }
    .spinner {
      width: 36px; height: 36px;
      border: 4px solid #f0f0f0;
      border-top-color: #1B4F72;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AdminComponent implements OnInit {

  viajes: Viaje[] = [];
  cargando = true;
  mensaje = '';
  esError = false;

  mostrarFormulario = false;
  mostrarConfirmacion = false;
  guardando = false;

  viajeEditando: Viaje | null = null;
  viajeAEliminar: Viaje | null = null;

  // Modelo del formulario
  form: Partial<Viaje> = {};

  constructor(
    private viajesService: ViajesService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarTodos();
  }

  cargarTodos(): void {
    this.cargando = true;
    // Llama a GET /api/viajes/todos → incluye activos e inactivos
    this.viajesService.getTodosLosViajes().subscribe({
      next: (viajes) => {
        this.viajes = viajes;
        this.cargando = false;
      },
      error: () => {
        this.mostrarMensaje('Error al cargar los viajes. Comprueba que estás autenticado.', true);
        this.cargando = false;
      }
    });
  }

  abrirFormulario(viaje: Viaje | null): void {
    this.viajeEditando = viaje;
    // Si es edición, copia los datos al formulario. Si es nuevo, vacía el formulario.
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

    if (this.viajeEditando?.id) {
      // Editar viaje existente → PUT /api/viajes/{id}
      this.viajesService.actualizarViaje(this.viajeEditando.id, this.form as Viaje).subscribe({
        next: () => {
          this.mostrarMensaje('Viaje actualizado correctamente.');
          this.cerrarFormulario();
          this.cargarTodos();
          this.guardando = false;
        },
        error: () => {
          this.mostrarMensaje('Error al actualizar el viaje.', true);
          this.guardando = false;
        }
      });
    } else {
      // Crear nuevo viaje → POST /api/viajes
      this.viajesService.crearViaje(this.form as Viaje).subscribe({
        next: () => {
          this.mostrarMensaje('Viaje creado correctamente.');
          this.cerrarFormulario();
          this.cargarTodos();
          this.guardando = false;
        },
        error: () => {
          this.mostrarMensaje('Error al crear el viaje.', true);
          this.guardando = false;
        }
      });
    }
  }

  toggleActivo(viaje: Viaje): void {
    if (viaje.activo) {
      // Desactivar → PATCH /api/viajes/{id}/desactivar
      this.viajesService.desactivarViaje(viaje.id!).subscribe({
        next: () => {
          this.mostrarMensaje(`"${viaje.titulo}" desactivado.`);
          this.cargarTodos();
        },
        error: () => this.mostrarMensaje('Error al desactivar el viaje.', true)
      });
    } else {
      // Reactivar: enviamos un PUT con activo=true
      const actualizado = { ...viaje, activo: true };
      this.viajesService.actualizarViaje(viaje.id!, actualizado as Viaje).subscribe({
        next: () => {
          this.mostrarMensaje(`"${viaje.titulo}" reactivado.`);
          this.cargarTodos();
        },
        error: () => this.mostrarMensaje('Error al reactivar el viaje.', true)
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
        this.mostrarMensaje(`"${this.viajeAEliminar?.titulo}" eliminado permanentemente.`);
        this.mostrarConfirmacion = false;
        this.viajeAEliminar = null;
        this.cargarTodos();
      },
      error: () => {
        this.mostrarMensaje('Error al eliminar el viaje.', true);
        this.mostrarConfirmacion = false;
      }
    });
  }

  private mostrarMensaje(texto: string, error = false): void {
    this.mensaje = texto;
    this.esError = error;
    // El mensaje desaparece solo a los 4 segundos
    setTimeout(() => this.mensaje = '', 4000);
  }
}
