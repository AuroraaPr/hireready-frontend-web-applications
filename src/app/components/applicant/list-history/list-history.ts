import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { SimulationService } from '../../../services/simulation-service';
import { SimulationHistoryItemResponseDTO } from '../../../models/simulationHistoryItemResponseDTO';
import { SimulationStatus } from '../../../models/simulationStatus';

@Component({
  selector: 'app-list-history',
  standalone: false,
  templateUrl: './list-history.html',
  styleUrl: './list-history.css',
})
export class ListHistory implements OnInit {
  history: SimulationHistoryItemResponseDTO[] = [];
  filtered: SimulationHistoryItemResponseDTO[] = [];

  selectedStatus: string = 'ALL';
  selectedCompany: string = 'ALL';

  page: number = 1;
  pageSize: number = 8;

  loading: boolean = true;
  error: boolean = false;

  constructor(
    private simulationService: SimulationService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.loading = true;
    this.error = false;
    this.simulationService.getHistory().subscribe({
      next: (response) => {
        this.history = (response as SimulationHistoryItemResponseDTO[]).sort(
          (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
        );
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.history = [];
        this.filtered = [];
        this.loading = false;
        this.error = true;
        this.cdr.detectChanges();
      },
    });
  }

  get companies(): string[] {
    return Array.from(
      new Set(this.history.map((item) => item.companyName).filter((name) => name.length > 0)),
    );
  }

  applyFilters(): void {
    this.filtered = this.history.filter((item) => {
      const statusOk = this.selectedStatus === 'ALL' || item.status === this.selectedStatus;
      const companyOk = this.selectedCompany === 'ALL' || item.companyName === this.selectedCompany;
      return statusOk && companyOk;
    });
    this.page = 1;
  }

  get noHaySimulaciones(): boolean {
    return !this.loading && !this.error && this.history.length === 0;
  }

  get sinResultadosPorFiltro(): boolean {
    return !this.loading && !this.error && this.history.length > 0 && this.filtered.length === 0;
  }

  get paginated(): SimulationHistoryItemResponseDTO[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
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

  openReport(item: SimulationHistoryItemResponseDTO): void {
    if (item.canViewReport) {
      this.router.navigate(['/applicant/simulations', item.simulationId, 'report']);
    }
  }

  formatDate(date: string | null): string {
    if (!date) return '—';

    const value = new Date(date);
    if (Number.isNaN(value.getTime())) return '—';

    const day = String(value.getDate()).padStart(2, '0');
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const year = value.getFullYear();
    const hour = String(value.getHours()).padStart(2, '0');
    const minute = String(value.getMinutes()).padStart(2, '0');

    return day + '/' + month + '/' + year + ' ' + hour + ':' + minute;
  }

  durationText(item: SimulationHistoryItemResponseDTO): string {
    if (!item.completedAt) return 'En curso';

    const start = new Date(item.startedAt).getTime();
    const end = new Date(item.completedAt).getTime();

    if (Number.isNaN(start) || Number.isNaN(end) || end < start) return '—';

    const totalMinutes = Math.round((end - start) / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) return hours + 'h ' + minutes + 'm';
    return minutes + 'm';
  }

  statusLabel(status: SimulationStatus): string {
    if (status === 'COMPLETED') return 'Completada';
    if (status === 'IN_PROGRESS') return 'En curso';
    if (status === 'ABANDONED') return 'Abandonada';
    return status;
  }

  statusClass(status: SimulationStatus): string {
    if (status === 'COMPLETED') return 'completed';
    if (status === 'IN_PROGRESS') return 'progress';
    if (status === 'ABANDONED') return 'abandoned';
    return '';
  }


}