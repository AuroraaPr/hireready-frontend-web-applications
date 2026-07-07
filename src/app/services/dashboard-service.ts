import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApplicantDashboardResponseDTO } from '../models/applicantDashboardResponseDTO';
import { CompanyDashboardResponseDTO } from '../models/companyDashboardResponseDTO';
import { DashboardResponseDTO } from '../models/dashboardResponseDTO';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  ruta_servidor: string = environment.apiUrl;;
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
