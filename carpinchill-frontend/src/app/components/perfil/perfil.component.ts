import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ClienteService, PerfilCliente } from '../../services/cliente.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="perfil-pagina">
      <div class="perfil-card">

        <!-- Cabecera con foto -->
        <div class="perfil-header">
          <div class="avatar-wrapper">
            <img
              [src]="perfil.imagenUrl || 'https://ui-avatars.com/api/?name=' + nombreUsuario + '&background=1B4F72&color=fff&size=128'"
              [alt]="nombreUsuario"
              class="avatar"
              (error)="onAvatarError($event)"
            />
          </div>
          <div class="perfil-header-info">
            <h1>{{ nombreUsuario }}</h1>
            <span class="rol-badge">{{ rolUsuario }}</span>
            <p class="email-usuario">{{ emailUsuario }}</p>
          </div>
        </div>

        <!-- Mensajes de estado -->
        <div *ngIf="mensaje" class="alerta" [class.alerta-ok]="exito" [class.alerta-error]="!exito">
          {{ mensaje }}
        </div>

        <!-- Formulario -->
        <form (ngSubmit)="guardar()" class="perfil-form">
          <h2>Información de contacto</h2>

          <div class="campo-grupo doble">
            <div class="campo">
              <label>Teléfono</label>
              <input type="tel" [(ngModel)]="perfil.telefono" name="telefono"
                     placeholder="Ej: 612345678" maxlength="15" />
            </div>
            <div class="campo">
              <label>DNI / NIE</label>
              <input type="text" [(ngModel)]="perfil.dni" name="dni"
                     placeholder="Ej: 12345678A" maxlength="9" />
            </div>
          </div>

          <div class="campo-grupo doble">
            <div class="campo">
              <label>Fecha de nacimiento</label>
              <input type="date" [(ngModel)]="perfil.fechaNacimiento" name="fechaNacimiento" />
            </div>
            <div class="campo">
              <label>Dirección</label>
              <input type="text" [(ngModel)]="perfil.direccion" name="direccion"
                     placeholder="Calle, número, ciudad" />
            </div>
          </div>

          <div class="campo-grupo">
            <div class="campo campo-full">
              <label>URL de foto de perfil</label>
              <input type="url" [(ngModel)]="perfil.imagenUrl" name="imagenUrl"
                     placeholder="https://images.unsplash.com/photo-XXXXX?w=400" (input)="onUrlFotoChange()" />
              <span class="campo-ayuda">Introduce la URL de una imagen para tu avatar</span>
            </div>
          </div>

          <div class="campo-grupo">
            <div class="campo campo-full">
              <label>Notas adicionales</label>
              <textarea [(ngModel)]="perfil.notas" name="notas"
                        placeholder="Preferencias de viaje, alergias, necesidades especiales..."
                        rows="3"></textarea>
            </div>
          </div>

          <div class="perfil-acciones">
            <button type="submit" class="btn-guardar" [disabled]="guardando">
              {{ guardando ? 'Guardando...' : '💾 Guardar cambios' }}
            </button>
            <a routerLink="/viajes" class="btn-volver">← Volver al catálogo</a>
          </div>
        </form>

      </div>
    </div>
  `,
  styles: [`
    .perfil-pagina {
      display: flex; justify-content: center;
      padding: 32px 16px; min-height: calc(100vh - 60px);
      background: #f0f4f8;
    }
    .perfil-card {
      background: white; border-radius: 20px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.1);
      width: 100%; max-width: 700px; padding: 32px;
    }

    /* Header */
    .perfil-header {
      display: flex; align-items: center; gap: 24px;
      margin-bottom: 32px; padding-bottom: 24px;
      border-bottom: 2px solid #eef2f7;
    }
    .avatar-wrapper {
      flex-shrink: 0;
      width: 100px; height: 100px; border-radius: 50%;
      overflow: hidden; border: 3px solid #1B4F72;
    }
    .avatar { width: 100%; height: 100%; object-fit: cover; }
    .perfil-header-info h1 { margin: 0 0 6px; font-size: 24px; color: #1B4F72; }
    .rol-badge {
      background: #1B4F72; color: white;
      padding: 3px 10px; border-radius: 12px; font-size: 11px;
      text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;
    }
    .email-usuario { margin: 8px 0 0; color: #666; font-size: 14px; }

    /* Alertas */
    .alerta {
      padding: 12px 16px; border-radius: 10px; margin-bottom: 20px; font-size: 14px;
    }
    .alerta-ok  { background: #e8f5e9; color: #2e7d32; border-left: 4px solid #4CAF50; }
    .alerta-error { background: #fef3f3; color: #c0392b; border-left: 4px solid #e74c3c; }

    /* Formulario */
    .perfil-form h2 { font-size: 18px; color: #333; margin: 0 0 20px; }
    .campo-grupo { display: flex; gap: 16px; margin-bottom: 16px; }
    .campo-grupo.doble .campo { flex: 1; }
    .campo { display: flex; flex-direction: column; gap: 5px; }
    .campo-full { flex: 1; }
    .campo label { font-size: 13px; font-weight: 600; color: #555; }
    .campo input, .campo textarea {
      padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px;
      font-size: 14px; transition: border-color 0.2s; font-family: inherit;
    }
    .campo input:focus, .campo textarea:focus {
      outline: none; border-color: #1B4F72; box-shadow: 0 0 0 3px rgba(27,79,114,0.1);
    }
    .campo textarea { resize: vertical; min-height: 80px; }
    .campo-ayuda { font-size: 11px; color: #999; }

    /* Acciones */
    .perfil-acciones {
      display: flex; align-items: center; gap: 16px; margin-top: 24px;
      padding-top: 20px; border-top: 1px solid #eee;
    }
    .btn-guardar {
      background: #1B4F72; color: white; border: none;
      padding: 10px 24px; border-radius: 10px; font-size: 15px;
      cursor: pointer; transition: background 0.2s; font-weight: 600;
    }
    .btn-guardar:hover:not(:disabled) { background: #154360; }
    .btn-guardar:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-volver {
      color: #666; font-size: 14px; text-decoration: none; transition: color 0.2s;
    }
    .btn-volver:hover { color: #1B4F72; }

    @media (max-width: 600px) {
      .campo-grupo.doble { flex-direction: column; }
      .perfil-header { flex-direction: column; text-align: center; }
    }
  `]
})
export class PerfilComponent implements OnInit {

  perfil: PerfilCliente = {};
  guardando = false;
  mensaje = '';
  exito = false;

  nombreUsuario = '';
  emailUsuario = '';
  rolUsuario = '';
  usuarioId: number | null = null;

  constructor(
    private authService: AuthService,
    private clienteService: ClienteService
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.getUsuarioActual();
    if (usuario) {
      this.nombreUsuario = usuario.nombre;
      this.emailUsuario = usuario.email;
      this.rolUsuario = usuario.rol.replace('ROLE_', '');
      this.usuarioId = usuario.usuarioId;
      this.cargarPerfil();
    }
  }

  cargarPerfil(): void {
    if (!this.usuarioId) return;
    this.clienteService.obtenerPerfilPorUsuario(this.usuarioId).subscribe({
      next: (cliente) => {
        // El backend devuelve el objeto Cliente completo; mapeamos los campos que nos interesan
        this.perfil = {
          telefono: (cliente as any).telefono || '',
          direccion: (cliente as any).direccion || '',
          dni: (cliente as any).dni || '',
          fechaNacimiento: (cliente as any).fechaNacimiento || '',
          imagenUrl: (cliente as any).imagenUrl || '',
          notas: (cliente as any).notas || ''
        };
      },
      error: () => {
        // 404 = todavía no tiene perfil, dejamos el formulario vacío
        this.perfil = {};
      }
    });
  }

  guardar(): void {
    if (!this.usuarioId) return;
    this.guardando = true;
    this.mensaje = '';

    this.clienteService.guardarPerfil(this.usuarioId, this.perfil).subscribe({
      next: () => {
        this.exito = true;
        this.mensaje = '✅ Perfil guardado correctamente.';
        this.guardando = false;
        // Ocultar el mensaje tras 3 segundos
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (err) => {
        this.exito = false;
        this.mensaje = '❌ Error al guardar el perfil. ' + (err.error || '');
        this.guardando = false;
      }
    });
  }

  onUrlFotoChange(): void {
    // El avatar se actualiza en tiempo real porque el [src] está vinculado a perfil.imagenUrl
  }

  onAvatarError(event: Event): void {
    // Si la URL de la foto falla, volvemos al avatar generado con las iniciales
    (event.target as HTMLImageElement).src =
      `https://ui-avatars.com/api/?name=${encodeURIComponent(this.nombreUsuario)}&background=1B4F72&color=fff&size=128`;
  }
}
