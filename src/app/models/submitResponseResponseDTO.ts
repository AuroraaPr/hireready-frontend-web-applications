import { QuestionResponseDTO } from './questionResponseDTO';

export interface SubmitResponseResponseDTO {
  simulationId: number;
  savedResponseId: number;
  nextQuestion: QuestionResponseDTO | null;
  totalQuestions: number;
  answeredQuestions: number;
  isLast: boolean;
}