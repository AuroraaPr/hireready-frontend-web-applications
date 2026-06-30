import { FillerWordResponseDTO } from './fillerWordResponseDTO';
import { ResponseDetailResponseDTO } from './responseDetailResponseDTO';

export interface SimulationReportFullResponseDTO {
  simulationId: number;
  bankName: string;
  companyName: string;
  startedAt: string;
  completedAt: string;
  overallScore: number;
  avgRelevance: number;
  avgClarity: number;
  avgStructure: number;
  wordsPerMinute: number;
  fillerWords: FillerWordResponseDTO[];
  responses: ResponseDetailResponseDTO[];
}