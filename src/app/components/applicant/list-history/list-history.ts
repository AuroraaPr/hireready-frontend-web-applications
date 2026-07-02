import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SimulationService } from '../../../services/simulation-service';
import { SimulationHistoryItemResponseDTO } from '../../../models/simulationHistoryItemResponseDTO';
import { SimulationStatus } from '../../../models/simulationStatus';

type HistoryRow = SimulationHistoryItemResponseDTO & {
  overallScore?: number | null;
  score?: number | null;
};

@Component({
  selector: 'app-list-history',
  standalone: false,
  templateUrl: './list-history.html',
  styleUrl: './list-history.css',
})
export class ListHistory implements OnInit {
  history: HistoryRow[] = [];
  selectedStatus: string = 'ALL';
  selectedCompany: string = 'ALL';
  currentPage: number = 1;
  pageSize: number = 8;
  loading: boolean = true;

  constructor(
    private simulationService: SimulationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.simulationService.getHistory().subscribe({
      next: (response) => {
        this.history = response as HistoryRow[];
        this.history = this.history.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
        this.loading = false;
      },
      error: () => {
        this.history = [];
        this.loading = false;
      },
    });
  }

  get companies(): string[] {
    return Array.from(new Set(this.history.map((item) => item.companyName).filter((name) => name.length > 0)));
  }

  get filteredHistory(): HistoryRow[] {
    return this.history.filter((item) => {
      const statusOk = this.selectedStatus === 'ALL' || item.status === this.selectedStatus;
      const companyOk = this.selectedCompany === 'ALL' || item.companyName === this.selectedCompany;
      return statusOk && companyOk;
    });
  }

  get pagedHistory(): HistoryRow[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredHistory.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredHistory.length / this.pageSize));
  }

  get showingText(): string {
    return 'Mostrando ' + this.pagedHistory.length + ' de ' + this.filteredHistory.length + ' simulaciones';
  }

  applyFilters(): void {
    this.currentPage = 1;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage = this.currentPage - 1;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage = this.currentPage + 1;
    }
  }

  openReport(item: HistoryRow): void {
    if (item.canViewReport) {
      this.router.navigate(['/applicant/simulations', item.simulationId, 'report']);
    }
  }

  formatDate(date: string | null): string {
    if (!date) return '-';

    const value = new Date(date);
    if (Number.isNaN(value.getTime())) return '-';

    const day = String(value.getDate()).padStart(2, '0');
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const year = value.getFullYear();
    const hour = String(value.getHours()).padStart(2, '0');
    const minute = String(value.getMinutes()).padStart(2, '0');

    return day + '/' + month + '/' + year + ' ' + hour + ':' + minute;
  }

  durationText(item: HistoryRow): string {
    if (!item.completedAt) return 'En curso';

    const start = new Date(item.startedAt).getTime();
    const end = new Date(item.completedAt).getTime();

    if (Number.isNaN(start) || Number.isNaN(end) || end < start) return '-';

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

  scoreText(item: HistoryRow): string {
    const value = item.overallScore ?? item.score;
    if (value === null || value === undefined) return '-';
    return String(Math.round(value));
  }
}
