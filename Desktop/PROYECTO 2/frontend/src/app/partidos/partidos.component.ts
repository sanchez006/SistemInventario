import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PartidosService } from './partidos.service';

@Component({
  selector: 'app-partidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './partidos.component.html',
  styleUrls: ['./partidos.component.css']
})
export class PartidosComponent {
  partidos: any[] = [];
  nuevoPartido = { equipoLocalId: '', equipoVisitanteId: '', fecha: '', marcadorLocal: '', marcadorVisitante: '', cuartoActual: '', terminado: false, creadoEn: '' };
  error = '';
  partidoEditando: any = null;
  searchTerm = '';
  filtroTerminado: boolean | null = null;

  constructor(private partidosService: PartidosService) {}

  ngOnInit() {
    this.cargarPartidos();
  }

  cargarPartidos() {
    const params: any = {};
    if (this.searchTerm.trim()) params.q = this.searchTerm.trim();
    if (this.filtroTerminado !== null) params.terminado = this.filtroTerminado;
    this.partidosService.getPartidos(params).subscribe({
      next: (data) => this.partidos = data,
      error: () => this.error = 'Error al cargar partidos.'
    });
  }

  crearPartido() {
    if (!this.nuevoPartido.equipoLocalId || !this.nuevoPartido.equipoVisitanteId || !this.nuevoPartido.fecha || this.nuevoPartido.marcadorLocal === '' || this.nuevoPartido.marcadorVisitante === '' || this.nuevoPartido.cuartoActual === '') {
      this.error = 'Todos los campos son obligatorios.';
      return;
    }
  this.nuevoPartido.creadoEn = new Date().toISOString();
  this.nuevoPartido.fecha = new Date(this.nuevoPartido.fecha).toISOString();
  this.partidosService.createPartido(this.nuevoPartido).subscribe({
      next: () => {
        this.nuevoPartido = { equipoLocalId: '', equipoVisitanteId: '', fecha: '', marcadorLocal: '', marcadorVisitante: '', cuartoActual: '', terminado: false, creadoEn: '' };
        this.error = '';
        this.cargarPartidos();
      },
      error: () => this.error = 'Error al crear partido.'
    });
  }

  iniciarEdicion(partido: any) {
    this.partidoEditando = { ...partido };
    this.error = '';
  }

  cancelarEdicion() {
    this.partidoEditando = null;
    this.error = '';
  }

  guardarEdicion() {
    if (!this.partidoEditando.equipoLocalId || !this.partidoEditando.equipoVisitanteId || !this.partidoEditando.fecha || this.partidoEditando.marcadorLocal === '' || this.partidoEditando.marcadorVisitante === '' || this.partidoEditando.cuartoActual === '') {
      this.error = 'Todos los campos son obligatorios.';
      return;
    }
    const partidoActualizado = {
      id: this.partidoEditando.id,
      equipoLocalId: this.partidoEditando.equipoLocalId,
      equipoVisitanteId: this.partidoEditando.equipoVisitanteId,
      fecha: new Date(this.partidoEditando.fecha).toISOString(),
      marcadorLocal: this.partidoEditando.marcadorLocal,
      marcadorVisitante: this.partidoEditando.marcadorVisitante,
      cuartoActual: this.partidoEditando.cuartoActual,
      terminado: this.partidoEditando.terminado,
      creadoEn: this.partidoEditando.creadoEn ? new Date(this.partidoEditando.creadoEn).toISOString() : new Date().toISOString()
    };
    this.partidosService.updatePartido(partidoActualizado.id, partidoActualizado).subscribe({
      next: () => {
        this.partidoEditando = null;
        this.error = '';
        this.cargarPartidos();
      },
      error: () => this.error = 'Error al editar partido.'
    });
  }

  eliminarPartido(id: number) {
    if (confirm('¿Seguro que deseas eliminar este partido?')) {
      this.partidosService.deletePartido(id).subscribe({
        next: () => this.cargarPartidos(),
        error: () => this.error = 'Error al eliminar partido.'
      });
    }
  }
}
