import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ClienteService, PerfilCliente } from '../../services/cliente.service';

// Lista de países con código ISO y emoji de bandera
const PAISES = [
  { codigo: 'ES', nombre: 'España', bandera: '🇪🇸' },
  { codigo: 'FR', nombre: 'Francia', bandera: '🇫🇷' },
  { codigo: 'DE', nombre: 'Alemania', bandera: '🇩🇪' },
  { codigo: 'IT', nombre: 'Italia', bandera: '🇮🇹' },
  { codigo: 'PT', nombre: 'Portugal', bandera: '🇵🇹' },
  { codigo: 'GB', nombre: 'Reino Unido', bandera: '🇬🇧' },
  { codigo: 'US', nombre: 'Estados Unidos', bandera: '🇺🇸' },
  { codigo: 'MX', nombre: 'México', bandera: '🇲🇽' },
  { codigo: 'AR', nombre: 'Argentina', bandera: '🇦🇷' },
  { codigo: 'CO', nombre: 'Colombia', bandera: '🇨🇴' },
  { codigo: 'CL', nombre: 'Chile', bandera: '🇨🇱' },
  { codigo: 'PE', nombre: 'Perú', bandera: '🇵🇪' },
  { codigo: 'VE', nombre: 'Venezuela', bandera: '🇻🇪' },
  { codigo: 'EC', nombre: 'Ecuador', bandera: '🇪🇨' },
  { codigo: 'MA', nombre: 'Marruecos', bandera: '🇲🇦' },
  { codigo: 'JP', nombre: 'Japón', bandera: '🇯🇵' },
  { codigo: 'CN', nombre: 'China', bandera: '🇨🇳' },
  { codigo: 'NL', nombre: 'Países Bajos', bandera: '🇳🇱' },
  { codigo: 'BE', nombre: 'Bélgica', bandera: '🇧🇪' },
  { codigo: 'CH', nombre: 'Suiza', bandera: '🇨🇭' },
  { codigo: 'NO', nombre: 'Noruega', bandera: '🇳🇴' },
  { codigo: 'SE', nombre: 'Suecia', bandera: '🇸🇪' },
  { codigo: 'PL', nombre: 'Polonia', bandera: '🇵🇱' },
  { codigo: 'RO', nombre: 'Rumanía', bandera: '🇷🇴' },
  { codigo: 'OTHER', nombre: 'Otro', bandera: '🌍' },
];

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="perfil-pagina">
      <div class="perfil-card">

        <div class="perfil-header">
          <div class="avatar-wrapper">
            <img
              [src]="perfil.imagenUrl || 'https://ui-avatars.com/api/?name=' + nombreUsuario + '&background=1B4F72&color=fff&size=128'"
              [alt]="nombreUsuario" class="avatar" (error)="onAvatarError($event)"
            />
          </div>
          <div class="perfil-header-info">
            <h1>{{ nombreUsuario }} <span *ngIf="banderaSeleccionada">{{ banderaSeleccionada }}</span></h1>
            <span class="rol-badge">{{ rolUsuario }}</span>
            <p class="email-usuario">{{ emailUsuario }}</p>
          </div>
        </div>

        <div *ngIf="mensaje" class="alerta" [class.alerta-ok]="exito" [class.alerta-error]="!exito">
          {{ mensaje }}
        </div>

        <form (ngSubmit)="guardar()" class="perfil-form">
          <h2>Información de contacto</h2>

          <div class="campo-grupo doble">
            <div class="campo">
              <label>Teléfono</label>
              <input type="tel" [(ngModel)]="perfil.telefono" name="telefono" placeholder="Ej: 612345678" maxlength="15"/>
            </div>
            <div class="campo">
              <label>DNI / NIE</label>
              <input type="text" [(ngModel)]="perfil.dni" name="dni" placeholder="Ej: 12345678A" maxlength="9"/>
            </div>
          </div>

          <div class="campo-grupo doble">
            <div class="campo">
              <label>Fecha de nacimiento</label>
              <input type="date" [(ngModel)]="perfil.fechaNacimiento" name="fechaNacimiento"/>
            </div>
            <div class="campo">
              <label>País <span class="bandera-preview">{{ banderaSeleccionada }}</span></label>
              <select [(ngModel)]="perfil.paisCodigo" name="paisCodigo" (change)="actualizarBandera()">
                <option value="">-- Selecciona tu país --</option>
                <option *ngFor="let p of paises" [value]="p.codigo">{{ p.bandera }} {{ p.nombre }}</option>
              </select>
            </div>
          </div>

          <div class="campo-grupo">
            <div class="campo campo-full">
              <label>Dirección</label>
              <input type="text" [(ngModel)]="perfil.direccion" name="direccion" placeholder="Calle, número, ciudad"/>
            </div>
          </div>

          <div class="campo-grupo">
            <div class="campo campo-full">
              <label>URL de foto de perfil</label>
              <input type="url" [(ngModel)]="perfil.imagenUrl" name="imagenUrl"
                     placeholder="https://images.unsplash.com/photo-...?w=400"/>
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
    .perfil-pagina { display:flex; justify-content:center; padding:32px 16px; min-height:calc(100vh - 60px); background:var(--bg-app, #f0f4f8); }
    .perfil-card { background:var(--bg-card, white); border-radius:20px; box-shadow:0 4px 24px rgba(0,0,0,0.1); width:100%; max-width:700px; padding:32px; }
    .perfil-header { display:flex; align-items:center; gap:24px; margin-bottom:32px; padding-bottom:24px; border-bottom:2px solid #eef2f7; }
    .avatar-wrapper { flex-shrink:0; width:100px; height:100px; border-radius:50%; overflow:hidden; border:3px solid #1B4F72; }
    .avatar { width:100%; height:100%; object-fit:cover; }
    .perfil-header-info h1 { margin:0 0 6px; font-size:24px; color:#1B4F72; }
    .rol-badge { background:#1B4F72; color:white; padding:3px 10px; border-radius:12px; font-size:11px; text-transform:uppercase; font-weight:700; }
    .email-usuario { margin:8px 0 0; color:#666; font-size:14px; }
    .bandera-preview { font-size:20px; margin-left:8px; }
    .alerta { padding:12px 16px; border-radius:10px; margin-bottom:20px; font-size:14px; }
    .alerta-ok { background:#e8f5e9; color:#2e7d32; border-left:4px solid #4CAF50; }
    .alerta-error { background:#fef3f3; color:#c0392b; border-left:4px solid #e74c3c; }
    .perfil-form h2 { font-size:18px; color:#333; margin:0 0 20px; }
    .campo-grupo { display:flex; gap:16px; margin-bottom:16px; }
    .campo-grupo.doble .campo { flex:1; }
    .campo { display:flex; flex-direction:column; gap:5px; }
    .campo-full { flex:1; }
    .campo label { font-size:13px; font-weight:600; color:#555; }
    .campo input, .campo select, .campo textarea { padding:10px 12px; border:1px solid #ddd; border-radius:8px; font-size:14px; font-family:inherit; background:var(--bg-input, white); color:var(--text-primary, #333); }
    .campo textarea { resize:vertical; min-height:80px; }
    .campo-ayuda { font-size:11px; color:#999; }
    .perfil-acciones { display:flex; align-items:center; gap:16px; margin-top:24px; padding-top:20px; border-top:1px solid #eee; }
    .btn-guardar { background:#1B4F72; color:white; border:none; padding:10px 24px; border-radius:10px; font-size:15px; cursor:pointer; font-weight:600; }
    .btn-guardar:disabled { opacity:0.6; cursor:not-allowed; }
    .btn-volver { color:#666; font-size:14px; text-decoration:none; }
    @media (max-width:600px) { .campo-grupo.doble { flex-direction:column; } .perfil-header { flex-direction:column; text-align:center; } }
  `]
})
export class PerfilComponent implements OnInit {

  perfil: PerfilCliente & { paisCodigo?: string } = {};
  guardando = false;
  mensaje = '';
  exito = false;
  nombreUsuario = '';
  emailUsuario = '';
  rolUsuario = '';
  usuarioId: number | null = null;
  banderaSeleccionada = '';
  paises = PAISES;

  constructor(private authService: AuthService, private clienteService: ClienteService) {}

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
      next: (cliente: any) => {
        this.perfil = {
          telefono: cliente.telefono || '',
          direccion: cliente.direccion || '',
          dni: cliente.dni || '',
          fechaNacimiento: cliente.fechaNacimiento || '',
          imagenUrl: cliente.imagenUrl || '',
          notas: cliente.notas || '',
          paisCodigo: cliente.paisCodigo || ''
        };
        this.actualizarBandera();
      },
      error: () => { this.perfil = {}; }
    });
  }

  actualizarBandera(): void {
    const pais = this.paises.find(p => p.codigo === this.perfil.paisCodigo);
    this.banderaSeleccionada = pais ? pais.bandera : '';
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
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (err) => {
        this.exito = false;
        this.mensaje = '❌ Error al guardar el perfil.';
        this.guardando = false;
      }
    });
  }

  onAvatarError(event: Event): void {
    (event.target as HTMLImageElement).src =
      `https://ui-avatars.com/api/?name=${encodeURIComponent(this.nombreUsuario)}&background=1B4F72&color=fff&size=128`;
  }
}
