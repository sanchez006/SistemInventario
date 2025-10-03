// Mover este archivo a c:\Users\sanchez006\Desktop\PROYECTO 2\frontend\src\app\jugadores\jugadores.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JugadoresService } from './jugadores.service';

@Component({
  selector: 'app-jugadores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './jugadores.component.html',
  styleUrl: './jugadores.component.css'
})
export class JugadoresComponent {
  jugadores: any[] = [];
  nuevoJugador = { equipoId: '', numero: '', estatura: '', edad: '', nombre: '', posicion: '', nacionalidad: '', creadoEn: '' };
  error = '';
  jugadorEditando: any = null;
  searchTerm = '';
  filtroEquipoId: number | null = null;

  constructor(private jugadoresService: JugadoresService) {}

  ngOnInit() {
    this.cargarJugadores();
  }

  cargarJugadores() {
    const params: any = {};
    if (this.searchTerm.trim()) params.q = this.searchTerm.trim();
    if (this.filtroEquipoId) params.equipoId = this.filtroEquipoId;
    this.jugadoresService.getJugadores(params).subscribe({
      next: (data) => this.jugadores = data,
      error: () => this.error = 'Error al cargar jugadores.'
    });
  }

  crearJugador() {
    if (!this.nuevoJugador.equipoId || !this.nuevoJugador.numero || !this.nuevoJugador.estatura || !this.nuevoJugador.edad || !this.nuevoJugador.nombre.trim() || !this.nuevoJugador.posicion.trim() || !this.nuevoJugador.nacionalidad.trim()) {
      this.error = 'Todos los campos son obligatorios.';
      return;
    }
    this.nuevoJugador.creadoEn = new Date().toISOString();
    this.jugadoresService.createJugador(this.nuevoJugador).subscribe({
      next: () => {
        this.nuevoJugador = { equipoId: '', numero: '', estatura: '', edad: '', nombre: '', posicion: '', nacionalidad: '', creadoEn: '' };
        this.error = '';
        this.cargarJugadores();
      },
      error: () => this.error = 'Error al crear jugador.'
    });
  }

  iniciarEdicion(jugador: any) {
    this.jugadorEditando = { ...jugador };
    this.error = '';
  }

  cancelarEdicion() {
    this.jugadorEditando = null;
    this.error = '';
  }

  guardarEdicion() {
    if (!this.jugadorEditando.equipoId || !this.jugadorEditando.numero || !this.jugadorEditando.estatura || !this.jugadorEditando.edad || !this.jugadorEditando.nombre.trim() || !this.jugadorEditando.posicion.trim() || !this.jugadorEditando.nacionalidad.trim()) {
      this.error = 'Todos los campos son obligatorios.';
      return;
    }
    const jugadorActualizado = {
      id: this.jugadorEditando.id,
      equipoId: this.jugadorEditando.equipoId,
      numero: this.jugadorEditando.numero,
      estatura: this.jugadorEditando.estatura,
      edad: this.jugadorEditando.edad,
      nombre: this.jugadorEditando.nombre,
      posicion: this.jugadorEditando.posicion,
      nacionalidad: this.jugadorEditando.nacionalidad,
      creadoEn: this.jugadorEditando.creadoEn ? new Date(this.jugadorEditando.creadoEn).toISOString() : new Date().toISOString()
    };
    this.jugadoresService.updateJugador(jugadorActualizado.id, jugadorActualizado).subscribe({
      next: () => {
        this.jugadorEditando = null;
        this.error = '';
        this.cargarJugadores();
      },
      error: () => this.error = 'Error al editar jugador.'
    });
  }

  eliminarJugador(id: number) {
    if (confirm('¿Seguro que deseas eliminar este jugador?')) {
      this.jugadoresService.deleteJugador(id).subscribe({
        next: () => this.cargarJugadores(),
        error: () => this.error = 'Error al eliminar jugador.'
      });
    }
  }
}
