import { SimulationStatus } from './simulationStatus';

export interface SimulationHistoryItemResponseDTO {
  simulationId: number;
  bankName: string;
  companyName: string;
  startedAt: string;
  completedAt: string | null;
  status: SimulationStatus;
  canViewReport: boolean;
}
