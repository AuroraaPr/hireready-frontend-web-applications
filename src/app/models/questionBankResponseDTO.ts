import { QuestionResponseDTO } from './questionResponseDTO';

export interface QuestionBankResponseDTO {
  id: number;
  name: string;
  description: string;
  jobPosition: string;
  level: string;
  companyId: number;
  companyName: string;
  careerIds: number[];
  careerNames: string[];
  questions: QuestionResponseDTO[];
}