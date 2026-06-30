import { Component } from '@angular/core';
import { UserService } from '../../../services/user-service';
import { Router } from '@angular/router';
import { AuthorityRole } from '../../../models/authorityRole';

interface NavItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  items: NavItem[] = [];
  roleLabel: string = '';

  constructor(
    private userService: UserService,
    private router: Router,
  ) {}

  ngOnInit() {
    const role = this.userService.getRoleLogeado();
    this.items = this.buildItems(role);
    this.roleLabel = this.buildRoleLabel(role);
  }

  buildItems(role: AuthorityRole | null): NavItem[] {
    if (role === 'APPLICANT') {
      return [
        { icon: 'space_dashboard', label: 'Dashboard', route: '/applicant/dashboard' },
        { icon: 'graphic_eq', label: 'Simulaciones', route: '/applicant/simulations' },
        { icon: 'history', label: 'Historial', route: '/applicant/history' },
        { icon: 'person', label: 'Mi perfil', route: '/applicant/profile' },
      ];
    }
    if (role === 'COMPANY') {
      return [
        { icon: 'space_dashboard', label: 'Dashboard', route: '/company/dashboard' },
        { icon: 'description', label: 'Mis bancos', route: '/company/banks' },
        { icon: 'add_circle', label: 'Nuevo banco', route: '/company/banks/new' },
        { icon: 'person', label: 'Mi perfil', route: '/company/profile' },
      ];
    }
    if (role === 'ADMIN') {
      return [
        { icon: 'space_dashboard', label: 'Dashboard', route: '/admin/dashboard' },
        { icon: 'people', label: 'Postulantes', route: '/admin/applicants' },
        { icon: 'apartment', label: 'Empresas', route: '/admin/companies' },
        { icon: 'description', label: 'Bancos de preguntas', route: '/admin/banks' },
        { icon: 'school', label: 'Carreras', route: '/admin/careers' },
      ];
    }
    return [];
  }

  buildRoleLabel(role: AuthorityRole | null): string {
    if (role === 'APPLICANT') return 'Postulante';
    if (role === 'COMPANY') return 'Empresa';
    if (role === 'ADMIN') return 'Administrador';
    return '';
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
