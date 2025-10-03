import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/marcador']);
    }
  }

  login() {
    this.error = '';
    this.auth.login(this.username, this.password).subscribe({
      next: (res) => {
        if (res.token) {
          this.auth.saveToken(res.token);
          this.router.navigate(['/marcador']);
        } else {
          this.error = 'Token no recibido.';
        }
      },
      error: (err) => {
        this.error = 'Usuario o contraseña incorrectos.';
      }
    });
  }
}
