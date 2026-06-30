export interface ApplicantSummaryResponseDTO {
  applicantId: number;
  userId: number;
  email: string;
  name: string;
  bornDate: string;
  careerName: string;
  levelStudy: string;
  university: string;
  enabled: boolean;
  simulationCount: number;
}