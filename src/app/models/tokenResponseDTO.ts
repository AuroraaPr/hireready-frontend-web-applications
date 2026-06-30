import { AuthorityRole } from './authorityRole';

export interface TokenResponseDTO {
  jwt: string;
  userId: number;
  email: string;
  name: string;
  role: AuthorityRole;
  applicantId: number | null;
  companyId: number | null;
}