import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApplicantService } from '../../../services/applicant-service';
import { UserService } from '../../../services/user-service';
import { ApplicantSummaryResponseDTO } from '../../../models/applicantSummaryResponseDTO';
import { AccionTipo } from '../../shared/confirmar-accion/confirmar-accion';

type FiltroEstado = 'all' | 'active' | 'inactive';

@Component({
  selector: 'app-list-applicants',
  standalone: false,
  templateUrl: './list-applicants.html',
  styleUrl: './list-applicants.css',
})
export class ListApplicants implements OnInit {
  loading: boolean = true;
  error: boolean = false;

  applicants: ApplicantSummaryResponseDTO[] = [];
  filtered: ApplicantSummaryResponseDTO[] = [];

  searchTerm: string = '';
  filtroEstado: FiltroEstado = 'all';

  page: number = 1;
  pageSize: number = 8;

  // modal de confirmación
  modalVisible: boolean = false;
  modalAction: AccionTipo = 'deactivate';
  selected: ApplicantSummaryResponseDTO | null = null;

  constructor(
    private applicantService: ApplicantService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = false;
    this.applicantService.listAll().subscribe({
      next: (data) => {
        this.applicants = data;
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.error = true;
        this.cdr.detectChanges();
      },
    });
  }

  get totalActivos(): number {
    return this.applicants.filter((a) => a.enabled).length;
  }

  get totalInactivos(): number {
    return this.applicants.filter((a) => !a.enabled).length;
  }

  // US-17: distinguir "no hay postulantes registrados" (BD vacía) de "sin resultados de filtro"
  get noHayPostulantesRegistrados(): boolean {
    return !this.loading && !this.error && this.applicants.length === 0;
  }

  get sinResultadosPorFiltro(): boolean {
    return !this.loading && !this.error && this.applicants.length > 0 && this.filtered.length === 0;
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filtered = this.applicants.filter((a) => {
      const matchesTerm =
        term.length === 0 ||
        a.name.toLowerCase().includes(term) ||
        a.email.toLowerCase().includes(term) ||
        a.careerName.toLowerCase().includes(term) ||
        a.university.toLowerCase().includes(term);

      const matchesEstado =
        this.filtroEstado === 'all' ||
        (this.filtroEstado === 'active' && a.enabled) ||
        (this.filtroEstado === 'inactive' && !a.enabled);

      return matchesTerm && matchesEstado;
    });
    this.page = 1;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  setFiltroEstado(filtro: FiltroEstado): void {
    this.filtroEstado = filtro;
    this.applyFilters();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }

  get paginated(): ApplicantSummaryResponseDTO[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get rangoInicio(): number {
    return this.filtered.length === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
  }

  get rangoFin(): number {
    return Math.min(this.page * this.pageSize, this.filtered.length);
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
  }

  get pageNumbers(): (number | string)[] {
    const total = this.totalPages;
    const current = this.page;
    const delta = 1;
    const result: (number | string)[] = [];
    let last = 0;

    for (let i = 1; i <= total; i++) {
      const isEdge = i === 1 || i === total;
      const isNearCurrent = i >= current - delta && i <= current + delta;
      if (!isEdge && !isNearCurrent) continue;

      if (last !== 0 && i - last > 1) {
        result.push('...');
      }
      result.push(i);
      last = i;
    }

    return result;
  }

  initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter((p) => p.length > 0);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  // acciones de activar / desactivar

  openConfirm(applicant: ApplicantSummaryResponseDTO): void {
    this.selected = applicant;
    this.modalAction = applicant.enabled ? 'deactivate' : 'activate';
    this.modalVisible = true;
  }

  onCancelled(): void {
    this.modalVisible = false;
    this.selected = null;
  }

  onConfirmed(): void {
    if (!this.selected) return;
    const target = this.selected;

    const request$ =
      this.modalAction === 'deactivate'
        ? this.userService.desactivate(target.userId)
        : this.userService.activate(target.userId);

    request$.subscribe({
      next: (status) => {
        target.enabled = status.enabled;
        this.applyFilters();
        this.modalVisible = false;
        this.selected = null;
        this.cdr.detectChanges();
        this.snackBar.open(
          this.modalAction === 'deactivate' ? 'Postulante desactivado' : 'Postulante reactivado',
          'Cerrar',
          { duration: 3000, panelClass: 'snackbar-success' },
        );
      },
      error: () => {
        this.modalVisible = false;
        this.snackBar.open('No se pudo actualizar el estado del postulante', 'Cerrar', {
          duration: 3500,
          panelClass: 'snackbar-error',
        });
      },
    });
  }
}