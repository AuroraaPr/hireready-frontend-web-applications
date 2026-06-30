export interface QuestionBankSummaryResponseDTO {
  id: number;
  name: string;
  companyName: string;
  description: string;
  jobPosition: string;
  level: string;
  careerNames: string[];
  numQuestions: number;
  status: string;
}