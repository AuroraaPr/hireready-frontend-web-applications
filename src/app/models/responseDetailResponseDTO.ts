export interface ResponseDetailResponseDTO {
  responseId: number;
  orderIndex: number;
  questionContent: string;
  audioUrl: string;
  transcription: string;
  duration: number;
  relevanceScore: number;
  clarityScore: number;
  structureScore: number;
  feedback: string;
}