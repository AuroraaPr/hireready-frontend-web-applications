import { ScoreTimePointDTO } from './scoreTimePointDTO';
import { FillerWordResponseDTO } from './fillerWordResponseDTO';

export interface ApplicantDashboardResponseDTO {
  totalSimulations: number;
  completedSimulations: number;
  averageOverallScore: number;
  bestOverallScore: number;
  averageRelevance: number;
  averageClarity: number;
  averageStructure: number;
  scoreOverTime: ScoreTimePointDTO[];
  topFillerWords: FillerWordResponseDTO[];
  hasEnoughData: boolean;
  message: string;
}