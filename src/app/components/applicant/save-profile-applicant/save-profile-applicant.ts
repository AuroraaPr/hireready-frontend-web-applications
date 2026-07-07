import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApplicantService } from '../../../services/applicant-service';
import { CareerService } from '../../../services/career-service';
import { DashboardService } from '../../../services/dashboard-service';
import { UserService } from '../../../services/user-service';
import { UniversityService } from '../../../services/university-service';
import { UniversityApiResult } from '../../../models/universityApiResult';
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
export class SaveProfileApplicant implements OnInit, OnDestroy {
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

  // nombre e iniciales que se muestran en la tarjeta de la izquierda.
  // NO se actualizan mientras el usuario edita: solo al cargar y al guardar.
  displayName: string = '';
  private nameSub?: Subscription;

  birthDateView: string = '';
  careers: CareerResponseDTO[] = [];
  totalSimulations: number = 0;
  averageScore: number = 0;
  loading: boolean = true;
  saving: boolean = false;
  saved: boolean = false;

  // niveles de estudio: EXACTAMENTE los que valida el backend (evita el 400)
  levelOptions: string[] = [
    'Secundaria completa',
    'Certificación técnica',
    'Curso especializado',
    'Bootcamp',
    'Pregrado (ciclos 1 al 3)',
    'Pregrado (ciclos 4 al 6)',
    'Pregrado (ciclos 7 al 10)',
    'Egresado',
    'Diplomado',
    'Maestría',
    'Doctorado',
  ];

  // universidad: sugerencias desde la lista local (mismo servicio que el registro)
  universitySuggestions: UniversityApiResult[] = [];
  searchingUniversity: boolean = false;
  // nombre exacto de la universidad seleccionada de la lista (para no permitir texto libre)
  private selectedUniversityName: string = '';

  constructor(
    private applicantService: ApplicantService,
    private careerService: CareerService,
    private dashboardService: DashboardService,
    private userService: UserService,
    private universityService: UniversityService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // el nombre de la izquierda se alimenta del stream name$ (mismo mecanismo que el topbar).
    // así se actualiza de forma confiable al guardar, y no cambia mientras se edita el input.
    this.nameSub = this.userService.name$.subscribe((name) => {
      this.displayName = name || '';
      this.cdr.detectChanges();
    });
    this.loadProfile();
    this.loadCareers();
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.nameSub?.unsubscribe();
  }

  loadProfile(): void {
    this.applicantService.getMe().subscribe({
      next: (response) => {
        this.profile = response as ApplicantResponseDTO;
        this.birthDateView = this.formatDateForView(this.profile.bornDate);
        // respaldo: si no había nombre en el stream/localStorage, lo tomamos del perfil
        if (!this.displayName && this.profile.name) {
          this.userService.setNameLogeado(this.profile.name);
        }
        // la universidad que viene del backend ya es válida (fue seleccionada al registrarse)
        this.selectedUniversityName = this.profile.university || '';
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.showError('No se pudo cargar el perfil.');
        this.cdr.detectChanges();
      },
    });
  }

  loadCareers(): void {
    this.careerService.listPublic().subscribe({
      next: (response) => {
        this.careers = response as CareerResponseDTO[];
        this.cdr.detectChanges();
      },
      error: () => {
        this.careers = [];
        this.cdr.detectChanges();
      },
    });
  }

  loadDashboard(): void {
    this.dashboardService.forApplicant().subscribe({
      next: (response) => {
        const data = response as ApplicantDashboardResponseDTO;
        this.totalSimulations = data.totalSimulations || 0;
        this.averageScore = Math.round(data.averageOverallScore || 0);
        this.cdr.detectChanges();
      },
      error: () => {
        this.totalSimulations = 0;
        this.averageScore = 0;
        this.cdr.detectChanges();
      },
    });
  }

  // === Fecha: formato dd/mm/aaaa con máscara mientras escribe (como el registro) ===
  onBornDateInput(rawValue: string): void {
    const digits = rawValue.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    } else if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    this.birthDateView = formatted;
  }

  private isValidBirthDate(value: string): boolean {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
    if (!match) return false;
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const date = new Date(year, month - 1, day);
    const esFechaReal =
      date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
    const noEsFutura = date.getTime() <= Date.now();
    const anioRazonable = year >= 1930;
    return esFechaReal && noEsFutura && anioRazonable;
  }

  // === Universidad: búsqueda + validación (misma lógica que el registro) ===
  onUniversityInput(value: string): void {
    // si el texto deja de coincidir con la selección, se invalida
    if (value.trim() !== this.selectedUniversityName) {
      this.selectedUniversityName = '';
    }
    const term = (value || '').trim();
    if (term.length < 3) {
      this.universitySuggestions = [];
      this.searchingUniversity = false;
      return;
    }
    this.searchingUniversity = true;
    this.universityService.search(term).subscribe((results) => {
      this.universitySuggestions = results.slice(0, 6);
      this.searchingUniversity = false;
      this.cdr.detectChanges();
    });
  }

  selectUniversity(university: UniversityApiResult): void {
    this.selectedUniversityName = university.name;
    this.profile.university = university.name;
    this.universitySuggestions = [];
  }

  onUniversityBlur(): void {
    setTimeout(() => {
      this.universitySuggestions = [];
      this.cdr.detectChanges();
    }, 150);
  }

  private universityIsValid(): boolean {
    const value = (this.profile.university || '').trim();
    if (value.length === 0) return true; // universidad es opcional
    return value === this.selectedUniversityName;
  }

  save(): void {
    const bornDate = this.parseDateToApi(this.birthDateView);

    if (this.profile.name.trim().length === 0) {
      this.showError('Ingresa el nombre completo.');
      return;
    }

    if (!this.isValidBirthDate(this.birthDateView)) {
      this.showError('Ingresa una fecha válida con formato dd/mm/aaaa.');
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

    if (!this.universityIsValid()) {
      this.showError('Selecciona tu universidad de la lista de sugerencias, o deja el campo vacío.');
      return;
    }

    const dto: ApplicantUpdateDTO = {
      name: this.profile.name.trim(),
      bornDate: bornDate,
      careerId: Number(this.profile.careerId),
      levelStudy: this.profile.levelStudy,
      university: (this.profile.university || '').trim(),
    };

    this.saving = true;
    this.saved = false;

    this.applicantService.updateMe(dto).subscribe({
      next: (response) => {
        const updated = response as ApplicantResponseDTO;
        // el backend devuelve el perfil actualizado: lo usamos para refrescar todo
        this.profile = updated;
        this.birthDateView = this.formatDateForView(this.profile.bornDate);
        this.selectedUniversityName = this.profile.university || '';

        this.saving = false;
        this.saved = true;

        // setNameLogeado emite en name$, y la suscripción de arriba actualiza displayName
        // (izquierda) y el topbar a la vez, de forma confiable.
        const nombreFinal = updated.name || dto.name;
        this.userService.setNameLogeado(nombreFinal);

        this.showSuccess('Cambios guardados.');
        this.cdr.detectChanges();
      },
      error: (err) => {
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

  // iniciales para el avatar, derivadas del nombre GUARDADO (displayName)
  get initials(): string {
    const parts = this.displayName.split(' ').filter((part) => part.length > 0);
    if (parts.length === 0) return '·';
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