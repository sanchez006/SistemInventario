// ...existing code...
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EquiposService {
  private apiUrl = 'http://localhost:5192/api/Equipos';

  constructor(private http: HttpClient) { }

  getEquipos(params?: { q?: string; page?: number; pageSize?: number; }): Observable<any[]> {
    let httpParams = new HttpParams();
    if (params?.q) httpParams = httpParams.set('q', params.q);
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.pageSize) httpParams = httpParams.set('pageSize', params.pageSize);
    return this.http.get<any[]>(this.apiUrl, { params: httpParams });
  }

  createEquipo(equipo: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, equipo);
  }
  updateEquipo(id: number, equipo: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, equipo);
  }

  deleteEquipo(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
