export interface QuestionBankAdminSummaryResponseDTO {
  id: number;
  name: string;
  companyId: number;
  companyName: string;
  companyEnabled: boolean;
  jobPosition: string;
  level: string;
  careerNames: string[];
  numQuestions: number;
  numSimulations: number;
}