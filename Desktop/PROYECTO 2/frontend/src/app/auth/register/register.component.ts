import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  username = '';
  password = '';
  nombre = '';
  role: 'Usuario' | 'Admin' = 'Usuario';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  // Permitimos que un usuario logueado (especialmente Admin) use esta página para crear cuentas.
  ngOnInit() {}

  register() {
    this.error = '';
    const payload: any = { username: this.username, password: this.password, nombre: this.nombre };
    if (this.role === 'Admin') {
      payload.role = 'Admin';
    }
    this.auth.register(payload.username, payload.password, payload.nombre, payload.role).subscribe({
      next: (res) => {
        if (res.token) {
          this.auth.saveToken(res.token);
          this.router.navigate(['/marcador']);
        } else {
          this.error = 'Token no recibido.';
        }
      },
      error: (err) => {
        this.error = err?.error || 'No se pudo registrar.';
      }
    });
  }

  get isAdminUser(): boolean {
    return this.auth.isAdmin();
  }
}
