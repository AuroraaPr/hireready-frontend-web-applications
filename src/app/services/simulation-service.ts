import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SimulationStartRequestDTO } from '../models/simulationStartRequestDTO';
import { SimulationResponseDTO } from '../models/simulationResponseDTO';
import { ContinueSimulationResponseDTO } from '../models/continueSimulationResponseDTO';
import { SubmitResponseResponseDTO } from '../models/submitResponseResponseDTO';
import { ExitSimulationResponseDTO } from '../models/exitSimulationResponseDTO';
import { FinalizeSimulationResponseDTO } from '../models/finalizeSimulationResponseDTO';
import { SimulationReportFullResponseDTO } from '../models/simulationReportFullResponseDTO';
import { SimulationHistoryItemResponseDTO } from '../models/simulationHistoryItemResponseDTO';

@Injectable({
  providedIn: 'root',
})
export class SimulationService {
  ruta_servidor: string = 'http://localhost:8080/hireready';
  recurso: string = 'simulations';

  constructor(private http: HttpClient) {}

  
  start(dto: SimulationStartRequestDTO) {
    return this.http.post<SimulationResponseDTO>(this.ruta_servidor + '/applicants/me/' + this.recurso, dto);
  }

  getCurrent() {
    return this.http.get<ContinueSimulationResponseDTO>(this.ruta_servidor + '/applicants/me/' + this.recurso + '/current');
  }

  submitResponse(simulationId: number, questionId: number, duration: number, audio: Blob) {
    const formData = new FormData();
    formData.append('questionId', String(questionId));
    formData.append('duration', String(duration));
    formData.append('audio', audio, 'q' + questionId + '.webm');

    return this.http.post<SubmitResponseResponseDTO>(
      this.ruta_servidor + '/applicants/me/' + this.recurso + '/' + simulationId + '/responses',
      formData,
    );
  }

  exit(simulationId: number) {
    return this.http.post<ExitSimulationResponseDTO>(this.ruta_servidor + '/applicants/me/' + this.recurso + '/' + simulationId + '/exit', {});
  }

  finalize(simulationId: number) {
    return this.http.post<FinalizeSimulationResponseDTO>(this.ruta_servidor + '/applicants/me/' + this.recurso + '/' + simulationId + '/finalize', {});
  }

  getReport(simulationId: number) {
    return this.http.get<SimulationReportFullResponseDTO>(this.ruta_servidor + '/applicants/me/' + this.recurso + '/' + simulationId + '/report');
  }

  getHistory() {
    return this.http.get<SimulationHistoryItemResponseDTO[]>(this.ruta_servidor + '/applicants/me/' + this.recurso + '/history');
  }

  getResponseAudio(simulationId: number, responseId: number) {
    return this.http.get(this.ruta_servidor + '/applicants/me/' + this.recurso + '/' + simulationId + '/responses/' + responseId + '/audio', { responseType: 'blob' });
  }

  buildAudioUrl(simulationId: number, responseId: number) {
    return this.ruta_servidor + '/applicants/me/' + this.recurso + '/' + simulationId + '/responses/' + responseId + '/audio';
  }
}
