import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CompanyService } from '../../../services/company-service';
import { DashboardService } from '../../../services/dashboard-service';
import { UserService } from '../../../services/user-service';
import { CompanyResponseDTO } from '../../../models/companyResponseDTO';
import { CompanyUpdateDTO } from '../../../models/companyUpdateDTO';
import { CompanyDashboardResponseDTO } from '../../../models/companyDashboardResponseDTO';

@Component({
  selector: 'app-save-profile-company',
  standalone: false,
  templateUrl: './save-profile-company.html',
  styleUrl: './save-profile-company.css',
})
export class SaveProfileCompany implements OnInit {
  company: CompanyResponseDTO = {
    companyId: 0,
    userId: 0,
    email: '',
    name: '',
    description: '',
  };

  displayName: string = '';

  totalBanks: number = 0;
  loading: boolean = true;
  saving: boolean = false;
  saved: boolean = false;

  constructor(
    private companyService: CompanyService,
    private dashboardService: DashboardService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.displayName = this.userService.getNameLogeado() || '';
    this.loadProfile();
    this.loadDashboard();
  }

  loadProfile(): void {
    this.companyService.getMe().subscribe({
      next: (response) => {
        this.company = response as CompanyResponseDTO;

        if (!this.displayName) this.displayName = this.company.name;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.showError('No se pudo cargar el perfil de empresa.');
        this.cdr.detectChanges();
      },
    });
  }

  loadDashboard(): void {
    this.dashboardService.forCompany().subscribe({
      next: (response) => {
        const data = response as CompanyDashboardResponseDTO;
        this.totalBanks = data.totalBanks || 0;
        this.cdr.detectChanges();
      },
      error: () => {
        this.totalBanks = 0;
        this.cdr.detectChanges();
      },
    });
  }

  save(): void {
    if (this.company.name.trim().length === 0) {
      this.showError('Ingresa el nombre de la empresa.');
      return;
    }

    if (this.company.description.trim().length === 0) {
      this.showError('Ingresa la descripción de la empresa.');
      return;
    }

    if (this.company.description.length > 500) {
      this.showError('La descripción no debe superar los 500 caracteres.');
      return;
    }

    const dto: CompanyUpdateDTO = {
      name: this.company.name.trim(),
      description: this.company.description.trim(),
    };

    this.saving = true;
    this.saved = false;

    console.log('[perfil empresa] enviando update:', dto);

    this.companyService.updateMe(dto).subscribe({
      next: (response) => {
        console.log('[perfil empresa] respuesta OK:', response);

        this.company = response as CompanyResponseDTO;
        this.userService.setNameLogeado(dto.name);
        this.displayName = dto.name;
        this.saving = false;
        this.saved = true;
        this.showSuccess('Cambios guardados.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[perfil empresa] error al guardar:', err);
        this.saving = false;
        this.showError('No se pudieron guardar los cambios.');
        this.cdr.detectChanges();
      },
    });
  }

  cancel(): void {
    this.loadProfile();
    this.saved = false;
  }

  get initials(): string {
    const parts = this.displayName.split(' ').filter((part) => part.length > 0);
    if (parts.length === 0) return '·';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['snackbar-success'],
    });
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3500,
      panelClass: ['snackbar-error'],
    });
  }
}