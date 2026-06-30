import { CountByLabelDTO } from './countByLabelDTO';
import { QuestionScoreDTO } from './questionScoreDTO';

export interface CompanyDashboardResponseDTO {
  totalBanks: number;
  totalSimulations: number;
  simulationsPerBank: CountByLabelDTO[];
  topUsedBanks: CountByLabelDTO[];
  unusedBanks: string[];
  averageOverallScore: number;
  averageRelevance: number;
  averageClarity: number;
  averageStructure: number;
  lowestScoredQuestions: QuestionScoreDTO[];
  applicantsByCareer: CountByLabelDTO[];
  applicantsByLevelStudy: CountByLabelDTO[];
  topUniversities: CountByLabelDTO[];
  hasEnoughData: boolean;
  message: string;
}