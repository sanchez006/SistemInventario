import { Component } from '@angular/core';
import { ListaProductoComponent } from "./lista-producto/lista-producto.component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ListaProductoComponent,],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Inventario';
}
