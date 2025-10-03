import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquiposService } from './equipos.service';

@Component({
  selector: 'app-equipos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './equipos.component.html',
  styleUrl: './equipos.component.css'
})
export class EquiposComponent {
  equipos: any[] = [];
  nuevoEquipo = { nombre: '', ciudad: '', logo: '', creadoEn: '' };
  error = '';
  searchTerm = '';

  constructor(private equiposService: EquiposService) {}

  ngOnInit() {
    this.cargarEquipos();
  }

  cargarEquipos() {
    const params: any = {};
    if (this.searchTerm.trim()) params.q = this.searchTerm.trim();
    this.equiposService.getEquipos(params).subscribe({
      next: (data) => this.equipos = data,
      error: () => this.error = 'Error al cargar equipos.'
    });
  }

  crearEquipo() {
    if (!this.nuevoEquipo.nombre.trim() || !this.nuevoEquipo.ciudad.trim() || !this.nuevoEquipo.logo.trim()) {
      this.error = 'Todos los campos son obligatorios.';
      return;
    }
    // Asignar fecha actual si no se ha asignado
    this.nuevoEquipo.creadoEn = new Date().toISOString();
    this.equiposService.createEquipo(this.nuevoEquipo).subscribe({
      next: () => {
        this.nuevoEquipo = { nombre: '', ciudad: '', logo: '', creadoEn: '' };
        this.error = '';
        this.cargarEquipos();
      },
      error: () => this.error = 'Error al crear equipo.'
    });
  }

  equipoEditando: any = null;

  iniciarEdicion(equipo: any) {
  this.equipoEditando = { ...equipo };
  this.error = '';
  }

  cancelarEdicion() {
    this.equipoEditando = null;
    this.error = '';
  }

  guardarEdicion() {
    if (!this.equipoEditando.nombre.trim() || !this.equipoEditando.ciudad.trim() || !this.equipoEditando.logo.trim()) {
      this.error = 'Todos los campos son obligatorios.';
      return;
    }
    // Asegurar que el id esté presente y correcto
    const equipoActualizado = {
      id: this.equipoEditando.id,
      nombre: this.equipoEditando.nombre,
      ciudad: this.equipoEditando.ciudad,
      logo: this.equipoEditando.logo,
      creadoEn: this.equipoEditando.creadoEn ? new Date(this.equipoEditando.creadoEn).toISOString() : new Date().toISOString()
    };
    this.equiposService.updateEquipo(equipoActualizado.id, equipoActualizado).subscribe({
      next: () => {
        this.equipoEditando = null;
        this.error = '';
        this.cargarEquipos();
      },
      error: () => this.error = 'Error al editar equipo.'
    });
  }

  eliminarEquipo(id: number) {
    if (confirm('¿Seguro que deseas eliminar este equipo?')) {
      this.equiposService.deleteEquipo(id).subscribe({
        next: () => this.cargarEquipos(),
        error: () => this.error = 'Error al eliminar equipo.'
      });
    }
  }
}
