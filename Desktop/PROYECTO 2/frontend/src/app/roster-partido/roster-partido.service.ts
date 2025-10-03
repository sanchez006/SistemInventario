import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RosterPartidoService {
  private apiUrl = 'http://localhost:5192/api/RosterPartido';

  constructor(private http: HttpClient) {}

  getRoster(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  addRegistro(registro: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, registro);
  }

  deleteRegistro(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
