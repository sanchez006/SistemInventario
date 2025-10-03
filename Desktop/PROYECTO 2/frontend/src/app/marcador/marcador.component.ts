import { Component, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PartidosService } from '../partidos/partidos.service';
import { EquiposService } from '../equipos/equipos.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-marcador',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, RouterModule],
  templateUrl: './marcador.component.html',
  styleUrls: ['./marcador.component.css']
})
export class MarcadorComponent implements OnInit {
  partidos: any[] = [];
  equipos: any[] = [];
  partidoSeleccionado: any = null;
  equipoLocal: any = null;
  equipoVisitante: any = null;
  periodo = 1;
  tiempoSegundos = 10 * 60;
  timerInterval: any = null;
  pausado = true;

  partidoSeleccionadoId: number | null = null;
  private partidosCargados = false;
  private equiposCargados = false;
  private saveEstadoDebounce: any = null;

  get tiempo() {
    const min = Math.floor(this.tiempoSegundos / 60).toString().padStart(2, '0');
    const sec = (this.tiempoSegundos % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  }

  // Fallback para obtener el nombre del equipo por ID cuando el backend no incluye los objetos de equipo
  getNombreEquipo(id: number | string | null | undefined): string {
    if (id === null || id === undefined) return '';
    const team = this.equipos.find(e => Number(e.id) === Number(id));
    return team?.nombre ?? '';
  }

  constructor(
    private partidosService: PartidosService,
    private equiposService: EquiposService,
    private cdr: ChangeDetectorRef,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.partidosService.getPartidos().subscribe({
      next: (data) => {
        this.partidos = data;
        this.partidosCargados = true;
        // Si ya tenemos equipos cargados, seleccionar partido por defecto si aplica
        this.tryAutoSelectPartido();
      }
    });
    this.equiposService.getEquipos().subscribe({
      next: (data) => {
        // Inicializar puntos y faltas en todos los equipos
        this.equipos = data.map(equipo => ({
          ...equipo,
          puntos: typeof equipo.puntos === 'number' ? equipo.puntos : 0,
          faltas: typeof equipo.faltas === 'number' ? equipo.faltas : 0
        }));
        this.equiposCargados = true;
        // Intentar seleccionar el partido ahora que tenemos equipos
        this.tryAutoSelectPartido();
      }
    });
  }

  private tryAutoSelectPartido() {
    if (!this.partidosCargados || !this.equiposCargados) return;
    // Si ya hay uno seleccionado, re-seleccionar para poblar equipoLocal/Visitante
    if (this.partidoSeleccionadoId != null) {
      this.seleccionarPartido(this.partidoSeleccionadoId!);
      return;
    }
    // Si no hay seleccionado, tomar el primero si existe
    if (this.partidos.length > 0) {
      this.partidoSeleccionadoId = this.partidos[0].id;
      this.seleccionarPartido(this.partidoSeleccionadoId!);
    }
  }

  onPartidoSeleccionado() {
    if (this.partidoSeleccionadoId != null) {
      this.seleccionarPartido(this.partidoSeleccionadoId!);
    }
  }

  seleccionarPartido(id: number) {
    this.partidoSeleccionado = this.partidos.find(p => p.id === id);
    if (this.partidoSeleccionado) {
      const local = this.equipos.find(e => e.id === this.partidoSeleccionado.equipoLocalId);
      const visitante = this.equipos.find(e => e.id === this.partidoSeleccionado.equipoVisitanteId);
      // Usar objetos directos y asegurar inicialización
      const marcadorLocal = Number(this.partidoSeleccionado.marcadorLocal ?? 0);
      const marcadorVisitante = Number(this.partidoSeleccionado.marcadorVisitante ?? 0);
      this.equipoLocal = local ? { ...local, puntos: marcadorLocal, faltas: typeof local.faltas === 'number' ? local.faltas : 0 } : null;
      this.equipoVisitante = visitante ? { ...visitante, puntos: marcadorVisitante, faltas: typeof visitante.faltas === 'number' ? visitante.faltas : 0 } : null;
      this.periodo = this.partidoSeleccionado.cuartoActual || 1;
      this.tiempoSegundos = Number(this.partidoSeleccionado.tiempoRestanteSeg ?? (10 * 60));
    }
  }

  startTimer() {
    if (!this.pausado) return;
    this.pausado = false;
    this.timerInterval = setInterval(() => {
      if (this.tiempoSegundos > 0) {
        this.tiempoSegundos--;
      } else {
        this.stopTimer();
        // Aquí puedes agregar notificación visual/sonora
      }
    }, 1000);
  }

  stopTimer() {
    this.pausado = true;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.scheduleSaveEstado();
  }

  resetTimer() {
    this.stopTimer();
    this.tiempoSegundos = 10 * 60;
    this.scheduleSaveEstado();
  }

  sumarPuntos(equipo: 'local' | 'visitante', cantidad: number) {
    if (!this.equipoLocal || !this.equipoVisitante) return;
    if (equipo === 'local') {
      this.equipoLocal.puntos = Number(this.equipoLocal.puntos ?? 0) + cantidad;
    } else {
      this.equipoVisitante.puntos = Number(this.equipoVisitante.puntos ?? 0) + cantidad;
    }
    this.scheduleSaveEstado();
  }
  restarPuntos(equipo: 'local' | 'visitante', cantidad: number) {
    if (!this.equipoLocal || !this.equipoVisitante) return;
    if (equipo === 'local') this.equipoLocal.puntos = Math.max(0, this.equipoLocal.puntos - cantidad);
    else this.equipoVisitante.puntos = Math.max(0, this.equipoVisitante.puntos - cantidad);
    this.scheduleSaveEstado();
  }
  avanzarPeriodo() {
    if (this.periodo < 4) this.periodo++;
    this.scheduleSaveEstado();
  }
  retrocederPeriodo() {
    if (this.periodo > 1) this.periodo--;
    this.scheduleSaveEstado();
  }

  logout() {
    this.auth.logout();
  }

  isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  private scheduleSaveEstado() {
    if (!this.partidoSeleccionado?.id) return;
    if (this.saveEstadoDebounce) {
      clearTimeout(this.saveEstadoDebounce);
    }
    this.saveEstadoDebounce = setTimeout(() => this.saveEstado(), 500);
  }

  private saveEstado() {
    if (!this.partidoSeleccionado?.id) return;
    const estado = {
      marcadorLocal: Number(this.equipoLocal?.puntos ?? 0),
      marcadorVisitante: Number(this.equipoVisitante?.puntos ?? 0),
      cuartoActual: this.periodo,
      terminado: false,
      tiempoRestanteSeg: this.tiempoSegundos
    };
    this.partidosService.updateEstado(this.partidoSeleccionado.id, estado).subscribe({ next: () => {}, error: () => {} });
  }
}
