import { ChangeDetectorRef, Component } from '@angular/core';
import { CompanyDashboardResponseDTO } from '../../../models/companyDashboardResponseDTO';
import { ChartPointSingle } from '../../../models/chartPointSingle';
import { DashboardService } from '../../../services/dashboard-service';
import { UserService } from '../../../services/user-service';
import { Router } from '@angular/router';
import { CountByLabelDTO } from '../../../models/countByLabelDTO';

@Component({
  selector: 'app-dashboard-company',
  standalone: false,
  templateUrl: './dashboard-company.html',
  styleUrl: './dashboard-company.css',
})
export class DashboardCompany {
  loading: boolean = true;
  data!: CompanyDashboardResponseDTO;
  companyName: string = '';

  activeBanks: number = 0;
  totalApplicantsReached: number = 0;

  maxBankUsage: number = 1;
  maxUni: number = 1;

  careerData: ChartPointSingle[] = [];   // donut
  levelData: ChartPointSingle[] = [];    // barras verticales

  colorScheme: any = {
    domain: ['#1B6E5E', '#0E7490', '#0EA5E9', '#14B8A6', '#22C55E', '#6366F1', '#0891B2'],
  };

  showLegend: boolean = false;
  showLabels: boolean = true;
  gradient: boolean = false;
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  showXAxisLabel: boolean = false;
  showYAxisLabel: boolean = false;

  constructor(private dashboardService: DashboardService,
              private userService: UserService,
              private router: Router,
              private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.companyName = this.userService.getNameLogeado() || 'Empresa';

    this.dashboardService.forCompany().subscribe({
      next: (data: CompanyDashboardResponseDTO) => {
        this.data = data;
        this.calcular(data);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.loading = false;
      }
    });
  }

  calcular(data: CompanyDashboardResponseDTO) {

    this.activeBanks = data.totalBanks - data.unusedBanks.length;

    this.totalApplicantsReached = data.applicantsByLevelStudy
      .reduce((acc, item) => acc + item.count, 0);

    if (!data.hasEnoughData) return;

    this.maxBankUsage = this.maxDe(data.topUsedBanks);
    this.maxUni = this.maxDe(data.topUniversities);

    // carrera >> donut
    data.applicantsByCareer.forEach((c: CountByLabelDTO) => {
      const point: ChartPointSingle = { name: c.label, value: c.count };
      this.careerData.push(point);
    });
    this.careerData = this.careerData.slice();

    // nivel >> barras verticales
    data.applicantsByLevelStudy.forEach((l: CountByLabelDTO) => {
      const point: ChartPointSingle = { name: l.label, value: l.count };
      this.levelData.push(point);
    });
    this.levelData = this.levelData.slice();
  }

  maxDe(lista: CountByLabelDTO[]): number {
    let max = 1;
    lista.forEach(item => {
      if (item.count > max) max = item.count;
    });
    return max;
  }

  scoreClass(score: number): string {
    if (score < 60) return 'score-low';
    if (score < 75) return 'score-mid';
    return 'score-ok';
  }

  CrearNuevoBanco() {
    this.router.navigate(['/company/save-bank-company']);
  }
}
