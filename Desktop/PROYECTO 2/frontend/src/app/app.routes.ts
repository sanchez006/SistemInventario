import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard } from './auth/auth.guard';
export const routes: Routes = [
	{
		path: 'equipos',
		loadComponent: () => import('./equipos/equipos.component').then(m => m.EquiposComponent),
		canActivate: [authGuard],
		data: { roles: ['Admin'] }
	},
	{
		path: 'jugadores',
		loadComponent: () => import('./jugadores/jugadores.component').then(m => m.JugadoresComponent),
		canActivate: [authGuard],
		data: { roles: ['Admin'] }
	},
	{
		path: 'partidos',
		loadComponent: () => import('./partidos/partidos.component').then(m => m.PartidosComponent),
		canActivate: [authGuard],
		data: { roles: ['Admin'] }
	},
	{
		path: 'usuarios',
		loadComponent: () => import('./usuarios/usuarios.component').then(m => m.UsuariosComponent),
		canActivate: [authGuard],
		data: { roles: ['Admin'] }
	},
	{
		path: 'roster-partido',
		loadComponent: () => import('./roster-partido/roster-partido.component').then(m => m.RosterPartidoComponent),
		canActivate: [authGuard],
		data: { roles: ['Admin'] }
	},
	{
		path: 'marcador',
		loadComponent: () => import('./marcador/marcador.component').then(m => m.MarcadorComponent)
	},
	{
		path: 'login',
		component: LoginComponent
	},
	{
		path: 'registrarse',
		component: RegisterComponent
	},
	{
		path: 'dashboard',
		component: DashboardComponent,
		canActivate: [authGuard]
	},
	{
		path: '',
		redirectTo: 'login',
		pathMatch: 'full'
	}
];
