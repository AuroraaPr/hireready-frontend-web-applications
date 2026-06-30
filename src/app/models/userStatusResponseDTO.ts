import { AuthorityRole } from './authorityRole';

export interface UserStatusResponseDTO {
  userId: number;
  email: string;
  role: AuthorityRole;
  enabled: boolean;
}