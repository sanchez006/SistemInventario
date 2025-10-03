import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PartidosService {
  private apiUrl = 'http://localhost:5192/api/Partidos';

  constructor(private http: HttpClient) { }

  getPartidos(params?: { q?: string; terminado?: boolean; page?: number; pageSize?: number; }): Observable<any[]> {
    let httpParams = new HttpParams();
    if (params?.q) httpParams = httpParams.set('q', params.q);
    if (params?.terminado !== undefined) httpParams = httpParams.set('terminado', params.terminado);
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.pageSize) httpParams = httpParams.set('pageSize', params.pageSize);
    return this.http.get<any[]>(this.apiUrl, { params: httpParams });
  }

  createPartido(partido: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, partido);
  }

  updatePartido(id: number, partido: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, partido);
  }

  updateEstado(id: number, estado: { marcadorLocal: number; marcadorVisitante: number; cuartoActual: number; terminado: boolean; tiempoRestanteSeg?: number; }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/estado`, estado);
  }

  deletePartido(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}

// ...existing code...
