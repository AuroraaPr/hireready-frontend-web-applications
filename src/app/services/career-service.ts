import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CareerResponseDTO } from '../models/careerResponseDTO';
import { CareerRequestDTO } from '../models/careerRequestDTO';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CareerService {
  ruta_servidor: string = environment.apiUrl;;
  recurso: string = 'careers';

  constructor(private http: HttpClient) {}

  listPublic() {
    return this.http.get<CareerResponseDTO[]>(this.ruta_servidor + '/' + this.recurso);
  }

  // para admin
  list() {
    return this.http.get<CareerResponseDTO[]>(this.ruta_servidor + '/admin/' + this.recurso);
  }

  add(dto: CareerRequestDTO) {
    return this.http.post<CareerResponseDTO>(this.ruta_servidor + '/admin/' + this.recurso, dto);
  }

  update(careerId: number, dto: CareerRequestDTO) {
    return this.http.put<CareerResponseDTO>(this.ruta_servidor + '/admin/' + this.recurso + '/' + careerId, dto);
  }
}
