import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RegisterCompanyRequestDTO } from '../models/registerCompanyRequestDTO';
import { CompanyResponseDTO } from '../models/companyResponseDTO';
import { CompanyUpdateDTO } from '../models/companyUpdateDTO';
import { CompanySummaryResponseDTO } from '../models/companySummaryResponseDTO';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  ruta_servidor: string = environment.apiUrl;
  recurso: string = 'companies';

  constructor(private http: HttpClient) {}

  register(dto: RegisterCompanyRequestDTO) {
    return this.http.post<CompanyResponseDTO>(this.ruta_servidor + '/' + this.recurso, dto);
  }

  getMe() {
    return this.http.get<CompanyResponseDTO>(this.ruta_servidor + '/' + this.recurso + '/me');
  }

  updateMe(dto: CompanyUpdateDTO) {
    return this.http.put<CompanyResponseDTO>(this.ruta_servidor + '/' + this.recurso + '/me', dto);
  }

  // para admin
  listAll() {
    return this.http.get<CompanySummaryResponseDTO[]>(this.ruta_servidor + '/admin/' + this.recurso);
  }
}
