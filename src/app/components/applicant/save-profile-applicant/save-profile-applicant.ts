import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApplicantService } from '../../../services/applicant-service';
import { CareerService } from '../../../services/career-service';
import { DashboardService } from '../../../services/dashboard-service';
import { ApplicantResponseDTO } from '../../../models/applicantResponseDTO';
import { ApplicantUpdateDTO } from '../../../models/applicantUpdateDTO';
import { CareerResponseDTO } from '../../../models/careerResponseDTO';
import { ApplicantDashboardResponseDTO } from '../../../models/applicantDashboardResponseDTO';

@Component({
  selector: 'app-save-profile-applicant',
  standalone: false,
  templateUrl: './save-profile-applicant.html',
  styleUrl: './save-profile-applicant.css',
})
export class SaveProfileApplicant implements OnInit {
  profile: ApplicantResponseDTO = {
    applicantId: 0,
    userId: 0,
    email: '',
    name: '',
    bornDate: '',
    careerId: 0,
    careerName: '',
    levelStudy: '',
    university: '',
  };

  birthDateView: string = '';
  careers: CareerResponseDTO[] = [];
  totalSimulations: number = 0;
  averageScore: number = 0;
  loading: boolean = true;
  saving: boolean = false;
  saved: boolean = false;

  levelOptions: string[] = [
    'Pregrado (ciclos 1 al 3)',
    'Pregrado (ciclos 4 al 6)',
    'Pregrado (ciclos 7 al 10)',
    'Egresado',
    'Bachiller',
    'Titulado',
  ];

  constructor(
    private applicantService: ApplicantService,
    private careerService: CareerService,
    private dashboardService: DashboardService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    this.loadCareers();
    this.loadDashboard();
  }

  loadProfile(): void {
    this.applicantService.getMe().subscribe({
      next: (response) => {
        this.profile = response as ApplicantResponseDTO;
        this.birthDateView = this.formatDateForView(this.profile.bornDate);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showError('No se pudo cargar el perfil.');
      },
    });
  }

  loadCareers(): void {
    this.careerService.listPublic().subscribe({
      next: (response) => {
        this.careers = response as CareerResponseDTO[];
      },
      error: () => {
        this.careers = [];
      },
    });
  }

  loadDashboard(): void {
    this.dashboardService.forApplicant().subscribe({
      next: (response) => {
        const data = response as ApplicantDashboardResponseDTO;
        this.totalSimulations = data.totalSimulations || 0;
        this.averageScore = Math.round(data.averageOverallScore || 0);
      },
      error: () => {
        this.totalSimulations = 0;
        this.averageScore = 0;
      },
    });
  }

  save(): void {
    const bornDate = this.parseDateToApi(this.birthDateView);

    if (this.profile.name.trim().length === 0) {
      this.showError('Ingresa el nombre completo.');
      return;
    }

    if (bornDate.length === 0) {
      this.showError('Ingresa la fecha con formato dd/mm/aaaa.');
      return;
    }

    if (this.profile.careerId <= 0) {
      this.showError('Selecciona una carrera.');
      return;
    }

    if (this.profile.levelStudy.trim().length === 0) {
      this.showError('Selecciona el nivel de estudio.');
      return;
    }

    if (this.profile.university.trim().length === 0) {
      this.showError('Ingresa la universidad.');
      return;
    }

    const dto: ApplicantUpdateDTO = {
      name: this.profile.name.trim(),
      bornDate: bornDate,
      careerId: Number(this.profile.careerId),
      levelStudy: this.profile.levelStudy,
      university: this.profile.university.trim(),
    };

    this.saving = true;
    this.saved = false;

    this.applicantService.updateMe(dto).subscribe({
      next: () => {
        localStorage.setItem('name', dto.name);
        this.saving = false;
        this.saved = true;
        this.showSuccess('Cambios guardados.');
      },
      error: () => {
        this.saving = false;
        this.showError('No se pudieron guardar los cambios.');
      },
    });
  }

  cancel(): void {
    this.loadProfile();
    this.saved = false;
  }

  get initials(): string {
    const parts = this.profile.name.split(' ').filter((part) => part.length > 0);
    if (parts.length === 0) return 'JP';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  formatDateForView(date: string): string {
    if (!date) return '';
    const parts = date.split('-');
    if (parts.length === 3) return parts[2] + '/' + parts[1] + '/' + parts[0];
    return date;
  }

  parseDateToApi(date: string): string {
    const cleanDate = date.trim();
    const parts = cleanDate.split('/');

    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];

      if (year.length === 4 && Number(day) >= 1 && Number(day) <= 31 && Number(month) >= 1 && Number(month) <= 12) {
        return year + '-' + month + '-' + day;
      }
    }

    const isoParts = cleanDate.split('-');
    if (isoParts.length === 3 && isoParts[0].length === 4) return cleanDate;

    return '';
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
