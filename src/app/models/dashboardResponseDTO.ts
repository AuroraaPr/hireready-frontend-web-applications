import { CountByLabelDTO } from './countByLabelDTO';
import { TimeBucketDTO } from './timeBucketDTO';

export interface DashboardResponseDTO {
  totalUsers: number;
  totalApplicants: number;
  totalCompanies: number;
  totalSimulations: number;
  simulationsOverTime: TimeBucketDTO[];
  applicantsByCareer: CountByLabelDTO[];
  applicantsByLevelStudy: CountByLabelDTO[];
  banksByCompany: CountByLabelDTO[];
  averageGlobalScore: number;
  hasEnoughData: boolean;
  message: string;
}