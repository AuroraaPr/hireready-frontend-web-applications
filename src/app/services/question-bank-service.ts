import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateQuestionBankRequestDTO } from '../models/createQuestionBankRequestDTO';
import { QuestionBankResponseDTO } from '../models/questionBankResponseDTO';
import { QuestionBankSummaryResponseDTO } from '../models/questionBankSummaryResponseDTO';
import { QuestionBankAdminSummaryResponseDTO } from '../models/questionBankAdminSummaryResponseDTO';

@Injectable({
  providedIn: 'root',
})
export class QuestionBankService {
  ruta_servidor: string = 'http://localhost:8080/hireready';
  recurso: string = 'question-banks';

  constructor(private http: HttpClient) {}

  create(dto: CreateQuestionBankRequestDTO) {
    return this.http.post<QuestionBankResponseDTO>(this.ruta_servidor + '/companies/me/' + this.recurso, dto);
  }

  listForApplicant() {
    return this.http.get<QuestionBankSummaryResponseDTO[]>(this.ruta_servidor + '/applicants/me/' + this.recurso);
  }

  // para admin
  listForAdmin() {
    return this.http.get<QuestionBankAdminSummaryResponseDTO[]>(this.ruta_servidor + '/admin/' + this.recurso);
  }

  getByIdForAdmin(bankId: number) {
    return this.http.get<QuestionBankResponseDTO>(this.ruta_servidor + '/admin/' + this.recurso + '/' + bankId);
  }
}
