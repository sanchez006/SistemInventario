import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from './usuarios.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent {
  usuarios: any[] = [];
  nuevoUsuario = { username: '', password_hash: '', nombre: '', Rol: '', creado_en: '' };
  error = '';
  usuarioEditando: any = null;

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuariosService.getUsuarios().subscribe({
      next: (data) => this.usuarios = data,
      error: () => this.error = 'Error al cargar usuarios.'
    });
  }

  crearUsuario() {
    if (!this.nuevoUsuario.username.trim() || !this.nuevoUsuario.password_hash.trim() || !this.nuevoUsuario.nombre.trim() || !this.nuevoUsuario.Rol.trim()) {
      this.error = 'Todos los campos son obligatorios.';
      return;
    }
    this.nuevoUsuario.creado_en = new Date().toISOString();
    this.usuariosService.createUsuario(this.nuevoUsuario).subscribe({
      next: () => {
        this.nuevoUsuario = { username: '', password_hash: '', nombre: '', Rol: '', creado_en: '' };
        this.error = '';
        this.cargarUsuarios();
      },
      error: () => this.error = 'Error al crear usuario.'
    });
  }

  iniciarEdicion(usuario: any) {
    this.usuarioEditando = { ...usuario };
    this.error = '';
  }

  cancelarEdicion() {
    this.usuarioEditando = null;
    this.error = '';
  }

  guardarEdicion() {
    if (!this.usuarioEditando ||
        typeof this.usuarioEditando.username !== 'string' || !this.usuarioEditando.username.trim() ||
        typeof this.usuarioEditando.password_hash !== 'string' || !this.usuarioEditando.password_hash.trim() ||
        typeof this.usuarioEditando.nombre !== 'string' || !this.usuarioEditando.nombre.trim() ||
        typeof this.usuarioEditando.Rol !== 'string' || !this.usuarioEditando.Rol.trim()) {
      this.error = 'Todos los campos son obligatorios.';
      return;
    }
    const usuarioActualizado = {
      Id: this.usuarioEditando.id,
      Username: this.usuarioEditando.username,
      PasswordHash: this.usuarioEditando.password_hash,
      Nombre: this.usuarioEditando.nombre,
      Rol: this.usuarioEditando.Rol,
      CreadoEn: this.usuarioEditando.creado_en ? new Date(this.usuarioEditando.creado_en).toISOString() : new Date().toISOString()
    };
    this.usuariosService.updateUsuario(this.usuarioEditando.id, usuarioActualizado).subscribe({
      next: () => {
        this.usuarioEditando = null;
        this.error = '';
        this.cargarUsuarios();
      },
      error: () => this.error = 'Error al editar usuario.'
    });
  }

  eliminarUsuario(id: number) {
    if (confirm('¿Seguro que deseas eliminar este usuario?')) {
      this.usuariosService.deleteUsuario(id).subscribe({
        next: () => this.cargarUsuarios(),
        error: () => this.error = 'Error al eliminar usuario.'
      });
    }
  }
}
