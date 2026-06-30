import { QuestionRequestDTO } from './questionRequestDTO';

export interface CreateQuestionBankRequestDTO {
  name: string;
  description: string;
  jobPosition: string;
  level: string;
  careerIds: number[];
  questions: QuestionRequestDTO[];
}