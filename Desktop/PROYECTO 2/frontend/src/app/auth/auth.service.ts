import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5192/api/Auth/login';
  private registerUrl = 'http://localhost:5192/api/Auth/register';
  private tokenKey = 'jwt_token';

  constructor(private http: HttpClient, private router: Router) { }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { username, password });
  }

  register(username: string, password: string, nombre: string, role?: string): Observable<any> {
    const body: any = { username, password, nombre };
    if (role) body.role = role;
    return this.http.post<any>(this.registerUrl, body);
  }

  saveToken(token: string) {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  private decodePayload(): any | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const base64 = token.split('.')[1] || '';
      const json = atob(base64);
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  getRole(): string | null {
    const payload = this.decodePayload();
    if (!payload) return null;
    // Typical keys: 'role' or ClaimTypes.Role URI
    return (
      payload['role'] ||
      payload['roles'] ||
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      null
    );
  }

  hasRole(role: string): boolean {
    const r = this.getRole();
    if (!r) return false;
    if (Array.isArray(r)) return r.includes(role);
    return r === role;
  }

  isAdmin(): boolean {
    return this.hasRole('Admin');
  }

  logout() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.tokenKey);
    }
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1] || '')) as { exp?: number };
      if (!payload?.exp) return true; // Si no hay exp, se considera válido por compatibilidad
      const nowSec = Math.floor(Date.now() / 1000);
      if (payload.exp <= nowSec) {
 
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem(this.tokenKey);
        }
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }
}
