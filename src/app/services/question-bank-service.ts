import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateQuestionBankRequestDTO } from '../models/createQuestionBankRequestDTO';
import { QuestionBankResponseDTO } from '../models/questionBankResponseDTO';
import { QuestionBankSummaryResponseDTO } from '../models/questionBankSummaryResponseDTO';
import { QuestionBankAdminSummaryResponseDTO } from '../models/questionBankAdminSummaryResponseDTO';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class QuestionBankService {
  ruta_servidor: string = environment.apiUrl;;
  recurso: string = 'question-banks';

  constructor(private http: HttpClient) {}

  create(dto: CreateQuestionBankRequestDTO) {
    return this.http.post<QuestionBankResponseDTO>(this.ruta_servidor + '/companies/me/' + this.recurso, dto);
  }

  listForApplicant(filter: string) {
    return this.http.get<QuestionBankSummaryResponseDTO[]>(this.ruta_servidor + '/applicants/me/' + this.recurso, { params: { filter } });
  }

  listForCompany() {
    return this.http.get<QuestionBankSummaryResponseDTO[]>(this.ruta_servidor + '/companies/me/' + this.recurso);
  }

  getByIdForCompany(bankId: number) {
    return this.http.get<QuestionBankResponseDTO>(this.ruta_servidor + '/companies/me/' + this.recurso + '/' + bankId);
  }

  // para admin
  listForAdmin() {
    return this.http.get<QuestionBankAdminSummaryResponseDTO[]>(this.ruta_servidor + '/admin/' + this.recurso);
  }

  getByIdForAdmin(bankId: number) {
    return this.http.get<QuestionBankResponseDTO>(this.ruta_servidor + '/admin/' + this.recurso + '/' + bankId);
  }
}
