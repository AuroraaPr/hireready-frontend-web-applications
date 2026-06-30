import { Component, Input } from '@angular/core';
import { UserService } from '../../../services/user-service';
import { AuthorityRole } from '../../../models/authorityRole';

@Component({
  selector: 'app-topbar',
  standalone: false,
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  @Input() breadcrumb: string = '';

  userName: string = '';
  userRole: string = '';
  userInitials: string = '';

  constructor(private userService: UserService) {}

  ngOnInit() {
    const role = this.userService.getRoleLogeado();
    this.userName = this.userService.getNameLogeado() || 'Usuario';
    this.userRole = this.roleLabel(role);
    this.userInitials = this.computeInitials(this.userName);
  }

  roleLabel(role: AuthorityRole | null): string {
    if (role === 'APPLICANT') return 'Postulante';
    if (role === 'COMPANY') return 'Empresa';
    if (role === 'ADMIN') return 'Administrador';
    return '';
  }

  computeInitials(name: string): string {
    const parts = name.split(/[\s.]+/).filter((p) => p.length > 0);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
}
