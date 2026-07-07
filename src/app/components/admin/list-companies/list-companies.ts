import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { CompanyService } from '../../../services/company-service';
import { UserService } from '../../../services/user-service';
import { QuestionBankService } from '../../../services/question-bank-service';
import { CompanySummaryResponseDTO } from '../../../models/companySummaryResponseDTO';
import { AccionTipo } from '../../shared/confirmar-accion/confirmar-accion';

type FiltroEstado = 'all' | 'active' | 'inactive';

export interface CompanyRow extends CompanySummaryResponseDTO {
  simulationsGenerated: number;
}

@Component({
  selector: 'app-list-companies',
  standalone: false,
  templateUrl: './list-companies.html',
  styleUrl: './list-companies.css',
})
export class ListCompanies implements OnInit {
  loading: boolean = true;
  error: boolean = false;

  companies: CompanyRow[] = [];
  filtered: CompanyRow[] = [];

  searchTerm: string = '';
  filtroEstado: FiltroEstado = 'all';

  page: number = 1;
  pageSize: number = 7;

  // modal de confirmación
  modalVisible: boolean = false;
  modalAction: AccionTipo = 'deactivate';
  selected: CompanyRow | null = null;

  constructor(
    private companyService: CompanyService,
    private userService: UserService,
    private questionBankService: QuestionBankService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = false;

    forkJoin({
      companies: this.companyService.listAll(),
      banks: this.questionBankService.listForAdmin(),
    }).subscribe({
      next: ({ companies, banks }) => {
        const simsByCompany = new Map<number, number>();
        for (const bank of banks) {
          const prev = simsByCompany.get(bank.companyId) || 0;
          simsByCompany.set(bank.companyId, prev + bank.numSimulations);
        }

        this.companies = companies.map((c) => ({
          ...c,
          simulationsGenerated: simsByCompany.get(c.companyId) || 0,
        }));
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
    return this.companies.filter((c) => c.enabled).length;
  }

  get totalInactivos(): number {
    return this.companies.filter((c) => !c.enabled).length;
  }

  // US-18: distinguir "no hay empresas registradas" (BD vacía) de "sin resultados de filtro"
  get noHayEmpresasRegistradas(): boolean {
    return !this.loading && !this.error && this.companies.length === 0;
  }

  get sinResultadosPorFiltro(): boolean {
    return !this.loading && !this.error && this.companies.length > 0 && this.filtered.length === 0;
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filtered = this.companies.filter((c) => {
      const matchesTerm =
        term.length === 0 ||
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        (c.description || '').toLowerCase().includes(term);

      const matchesEstado =
        this.filtroEstado === 'all' ||
        (this.filtroEstado === 'active' && c.enabled) ||
        (this.filtroEstado === 'inactive' && !c.enabled);

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

  get paginated(): CompanyRow[] {
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


  openConfirm(company: CompanyRow): void {
    this.selected = company;
    this.modalAction = company.enabled ? 'deactivate' : 'activate';
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
          this.modalAction === 'deactivate' ? 'Empresa desactivada' : 'Empresa reactivada',
          'Cerrar',
          { duration: 3000, panelClass: 'snackbar-success' },
        );
      },
      error: () => {
        this.modalVisible = false;
        this.snackBar.open('No se pudo actualizar el estado de la empresa', 'Cerrar', {
          duration: 3500,
          panelClass: 'snackbar-error',
        });
      },
    });
  }
}