import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApplicantDashboardResponseDTO } from '../models/applicantDashboardResponseDTO';
import { CompanyDashboardResponseDTO } from '../models/companyDashboardResponseDTO';
import { DashboardResponseDTO } from '../models/dashboardResponseDTO';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  ruta_servidor: string = 'http://localhost:8080/hireready';
  recurso: string = 'dashboard';

  constructor(private http: HttpClient) {}

  forApplicant() {
    return this.http.get<ApplicantDashboardResponseDTO>(this.ruta_servidor + '/applicants/me/' + this.recurso);
  }

  forCompany() {
    return this.http.get<CompanyDashboardResponseDTO>(this.ruta_servidor + '/companies/me/' + this.recurso);
  }

  forAdmin() {
    return this.http.get<DashboardResponseDTO>(this.ruta_servidor + '/admin/' + this.recurso);
  }
}
