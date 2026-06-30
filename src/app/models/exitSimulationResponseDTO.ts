import { SimulationStatus } from './simulationStatus';

export interface ExitSimulationResponseDTO {
  simulationId: number;
  status: SimulationStatus;
  totalQuestions: number;
  answeredQuestions: number;
  message: string;
}
