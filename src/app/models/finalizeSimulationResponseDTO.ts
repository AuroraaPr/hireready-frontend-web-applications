import { SimulationStatus } from './simulationStatus';

export interface FinalizeSimulationResponseDTO {
  simulationId: number;
  status: SimulationStatus;
  completedAt: string;
  overallScore: number;
}