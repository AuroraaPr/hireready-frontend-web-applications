import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RegisterApplicantRequestDTO } from '../models/registerApplicantRequestDTO';
import { ApplicantResponseDTO } from '../models/applicantResponseDTO';
import { ApplicantUpdateDTO } from '../models/applicantUpdateDTO';
import { ApplicantSummaryResponseDTO } from '../models/applicantSummaryResponseDTO';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApplicantService {
  ruta_servidor: string = environment.apiUrl;
  recurso: string = 'applicants';

  constructor(private http: HttpClient) {}

  register(dto: RegisterApplicantRequestDTO) {
    return this.http.post<ApplicantResponseDTO>(this.ruta_servidor + '/' + this.recurso, dto);
  }

  getMe() {
    return this.http.get<ApplicantResponseDTO>(this.ruta_servidor + '/' + this.recurso + '/me');
  }

  updateMe(dto: ApplicantUpdateDTO) {
    return this.http.put<ApplicantResponseDTO>(this.ruta_servidor + '/' + this.recurso + '/me', dto);
  }

  // para admin
  listAll() {
    return this.http.get<ApplicantSummaryResponseDTO[]>(this.ruta_servidor + '/admin/' + this.recurso);
  }
}
