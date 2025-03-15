import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

//interfaz de la tabla de productos en la base de datos
export interface Producto{
  nombre:string,
  descripcion:string,
  precioCompra:number,
  procioVenta:number,
  cantidad:number,
  categoriaid:number,
  proveedorid:number,
}

@Injectable({
  providedIn: 'root'
})


export class ProductoService  {

  private apiURL='http://localhost:3000/productos';//URL de la api
 // private productos= new BehaviorSubject <Producto[]>([]);
  //productos

  constructor(private http: HttpClient) {}


  mostrarProductos(): Observable <any[]>  {
    return this.http.get<any[]> (this.apiURL);
  }
  
}