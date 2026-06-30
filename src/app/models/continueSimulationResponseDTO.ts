import { SimulationStatus } from './simulationStatus';
import { QuestionResponseDTO } from './questionResponseDTO';

export interface ContinueSimulationResponseDTO {
  simulationId: number;
  status: SimulationStatus;
  pendingQuestion: QuestionResponseDTO | null;
  totalQuestions: number;
  answeredQuestions: number;
}