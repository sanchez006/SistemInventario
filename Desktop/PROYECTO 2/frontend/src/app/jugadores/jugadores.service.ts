import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JugadoresService {
  private apiUrl = 'http://localhost:5192/api/Jugadores';

  constructor(private http: HttpClient) { }

  getJugadores(params?: { q?: string; equipoId?: number; page?: number; pageSize?: number; }): Observable<any[]> {
    let httpParams = new HttpParams();
    if (params?.q) httpParams = httpParams.set('q', params.q);
    if (params?.equipoId) httpParams = httpParams.set('equipoId', params.equipoId);
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.pageSize) httpParams = httpParams.set('pageSize', params.pageSize);
    return this.http.get<any[]>(this.apiUrl, { params: httpParams });
  }

  createJugador(jugador: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, jugador);
  }

  updateJugador(id: number, jugador: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, jugador);
  }

  deleteJugador(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}

// ...existing code...
