import { ChangeDetectorRef, Component } from '@angular/core';
import { DashboardResponseDTO } from '../../../models/dashboardResponseDTO';
import { ChartSerie } from '../../../models/chartSerie';
import { ChartPointSingle } from '../../../models/chartPointSingle';
import { DashboardService } from '../../../services/dashboard-service';
import { TimeBucketDTO } from '../../../models/timeBucketDTO';
import { CountByLabelDTO } from '../../../models/countByLabelDTO';

@Component({
  selector: 'app-dashboard-admin',
  standalone: false,
  templateUrl: './dashboard-admin.html',
  styleUrl: './dashboard-admin.css',
})
export class DashboardAdmin {
  loading: boolean = true;
  data!: DashboardResponseDTO;

  maxBanksByCompany: number = 1;

  simulationsData: ChartSerie[] = [];   // area chart temporal
  careerData: ChartPointSingle[] = [];  // donut
  levelData: ChartPointSingle[] = [];   // barras verticales

  
  colorScheme: any = {
    domain: ['#1B6E5E', '#0E7490', '#0EA5E9', '#14B8A6', '#22C55E', '#6366F1', '#0891B2'],
  };
  gradient: boolean = true;
  showLegend: boolean = false;
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  showXAxisLabel: boolean = false;
  showYAxisLabel: boolean = false;

  constructor(private dashboardService: DashboardService,
              private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.dashboardService.forAdmin().subscribe({
      next: (data: DashboardResponseDTO) => {
        this.data = data;
        this.mapCharts(data);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.loading = false;
      }
    });
  }

  mapCharts(data: DashboardResponseDTO) {
    if (!data.hasEnoughData) return;

    //simulaciones
    const points: ChartPointSingle[] = [];
    data.simulationsOverTime.forEach((t: TimeBucketDTO) => {
      const point: ChartPointSingle = {
        name: this.formatFecha(t.period),
        value: t.count,
      };
      points.push(point);
    });
    const serie: ChartSerie = { name: 'Simulaciones', series: points };
    this.simulationsData = [serie];
    this.simulationsData = this.simulationsData.slice();

    // carrera
    data.applicantsByCareer.forEach((c: CountByLabelDTO) => {
      const point: ChartPointSingle = { name: c.label, value: c.count };
      this.careerData.push(point);
    });
    this.careerData = this.careerData.slice();

    // nivel
    data.applicantsByLevelStudy.forEach((l: CountByLabelDTO) => {
      const point: ChartPointSingle = { name: l.label, value: l.count };
      this.levelData.push(point);
    });
    this.levelData = this.levelData.slice();

    this.maxBanksByCompany = this.maxDe(data.banksByCompany);
  }

  maxDe(lista: CountByLabelDTO[]): number {
    let max = 1;
    lista.forEach(item => {
      if (item.count > max) max = item.count;
    });
    return max;
  }

  formatFecha(period: string): string {
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun',
                   'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const partes = period.split('-');
    const mes = parseInt(partes[1], 10) - 1;
    const dia = parseInt(partes[2], 10);
    return dia + ' ' + meses[mes];
  }
}
