import { SimulationStatus } from './simulationStatus';

export interface SimulationResponseDTO {
  simulationId: number;
  applicantId: number;
  questionBankId: number;
  questionBankName: string;
  status: SimulationStatus;
  startedAt: string;
  completedAt: string | null;
}