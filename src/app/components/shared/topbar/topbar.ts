import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from '../../../services/user-service';
import { AuthorityRole } from '../../../models/authorityRole';

@Component({
  selector: 'app-topbar',
  standalone: false,
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar implements OnInit, OnDestroy {
  @Input() breadcrumb: string = '';

  userName: string = '';
  userRole: string = '';
  userInitials: string = '';

  private nameSub?: Subscription;

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const role = this.userService.getRoleLogeado();
    this.userRole = this.roleLabel(role);

    this.nameSub = this.userService.name$.subscribe((name) => {
      this.userName = name || 'Usuario';
      this.userInitials = this.computeInitials(this.userName);
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.nameSub?.unsubscribe();
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