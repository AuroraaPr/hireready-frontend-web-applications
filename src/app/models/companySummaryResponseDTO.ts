export interface CompanySummaryResponseDTO {
  companyId: number;
  userId: number;
  email: string;
  name: string;
  description: string;
  enabled: boolean;
  questionBankCount: number;
}