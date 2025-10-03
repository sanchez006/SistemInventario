import { Component } from '@angular/core';
import { EquiposService } from '../equipos/equipos.service';
import { JugadoresService } from '../jugadores/jugadores.service';
import { PartidosService } from '../partidos/partidos.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RosterPartidoService } from './roster-partido.service';

@Component({
  selector: 'app-roster-partido',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roster-partido.component.html',
  styleUrls: ['./roster-partido.component.css']
})
export class RosterPartidoComponent {
  roster: any[] = [];
  equipos: any[] = [];
  jugadores: any[] = [];
  partidos: any[] = [];
  nuevoRegistro = { partido_id: '', equipo_id: '', jugador_id: '' };
  error = '';

  constructor(
    private rosterService: RosterPartidoService,
    private equiposService: EquiposService,
    private jugadoresService: JugadoresService,
    private partidosService: PartidosService
  ) {}

  ngOnInit() {
    this.cargarRoster();
    this.equiposService.getEquipos().subscribe({
      next: (data) => {
        this.equipos = data;
        console.log('Equipos:', this.equipos);
      }
    });
    this.jugadoresService.getJugadores().subscribe({
      next: (data) => {
        this.jugadores = data;
        console.log('Jugadores:', this.jugadores);
      }
    });
    this.partidosService.getPartidos().subscribe({
      next: (data) => {
        this.partidos = data;
        console.log('Partidos:', this.partidos);
      }
    });
  }

  cargarRoster() {
    this.rosterService.getRoster().subscribe({
      next: (data) => this.roster = data,
      error: () => this.error = 'Error al cargar roster.'
    });
  }

  agregarRegistro() {
    const partidoId = Number(this.nuevoRegistro.partido_id);
    const equipoId = Number(this.nuevoRegistro.equipo_id);
    const jugadorId = Number(this.nuevoRegistro.jugador_id);
    if (!partidoId || !equipoId || !jugadorId) {
      this.error = 'Todos los campos son obligatorios y deben ser números válidos.';
      return;
    }
    // Validar duplicados en el roster
  const existe = this.roster.some(r => r.partido_id == partidoId && r.equipo_id == equipoId && r.jugador_id == jugadorId);
    if (existe) {
      this.error = 'Este jugador ya está asignado a este partido y equipo.';
      return;
    }
  this.rosterService.addRegistro({ PartidoId: partidoId, EquipoId: equipoId, JugadorId: jugadorId }).subscribe({
      next: () => {
        this.nuevoRegistro = { partido_id: '', equipo_id: '', jugador_id: '' };
        this.error = '';
        this.cargarRoster();
      },
      error: () => this.error = 'Error al agregar registro. Verifica que los IDs existan y no estén duplicados.'
    });
  }

  eliminarRegistro(id: number) {
    if (confirm('¿Seguro que deseas eliminar este registro?')) {
      this.rosterService.deleteRegistro(id).subscribe({
        next: () => this.cargarRoster(),
        error: () => this.error = 'Error al eliminar registro.'
      });
    }
  }

  getNombreEquipo(id: number | string): string {
    const equipo = this.equipos.find(e => Number(e.id) === Number(id));
    return equipo ? equipo.nombre : String(id);
  }

  getNombreJugador(id: number | string): string {
    const jugador = this.jugadores.find(j => Number(j.id) === Number(id));
    return jugador ? jugador.nombre : String(id);
  }

  getNombrePartido(id: number | string): string {
    const partido = this.partidos.find(p => Number(p.id) === Number(id));
    if (partido) {
      const equipoLocal = this.equipos.find(e => Number(e.id) === Number(partido.equipoLocalId));
      const equipoVisitante = this.equipos.find(e => Number(e.id) === Number(partido.equipoVisitanteId));
      return equipoLocal && equipoVisitante
        ? `${equipoLocal.nombre} vs ${equipoVisitante.nombre}`
        : String(id);
    }
    return String(id);
  }
}
