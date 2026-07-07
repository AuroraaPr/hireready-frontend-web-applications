import { ChangeDetectorRef, Component } from '@angular/core';
import { ApplicantDashboardResponseDTO } from '../../../models/applicantDashboardResponseDTO';
import { ChartSerie } from '../../../models/chartSerie';
import { ChartPointSingle } from '../../../models/chartPointSingle';
import { DashboardService } from '../../../services/dashboard-service';
import { ScoreTimePointDTO } from '../../../models/scoreTimePointDTO';
import { UserService } from '../../../services/user-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-applicant',
  standalone: false,
  templateUrl: './dashboard-applicant.html',
  styleUrl: './dashboard-applicant.css',
})
export class DashboardApplicant {

  loading: boolean = true;
  data!: ApplicantDashboardResponseDTO;
  userName: string = '';
  completionRate: number = 0;

  scoreOverTimeData: ChartSerie[] = [];

  bankByPoint: { [key: string]: string } = {};
  fechaByPoint: { [key: string]: string } = {};


  colorScheme: any = {
    domain: ['#1B6E5E', '#2A8B78', '#F2C94C', '#D85A4A'],
  };
  gradient: boolean = true;
  showLegend: boolean = false;
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  showXAxisLabel: boolean = false;
  showYAxisLabel: boolean = false;

  constructor(private dashboardService: DashboardService,
              private userService: UserService,
              private router: Router,
              private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.userName = this.userService.getNameLogeado() || 'Postulante';

    this.dashboardService.forApplicant().subscribe({
      next: (data: ApplicantDashboardResponseDTO) => {
        this.data = data;
        this.completionRate = data.totalSimulations > 0
        ? Math.round((data.completedSimulations / data.totalSimulations) * 100)
        : 0;
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

  mapCharts(data: ApplicantDashboardResponseDTO) {
    if (!data.hasEnoughData) return;

    const points: ChartPointSingle[] = [];
    data.scoreOverTime.forEach((p: ScoreTimePointDTO, index: number) => {
      const label = 'Sim ' + (index + 1);
      const chartPoint: ChartPointSingle = {
        name: label,
        value: p.overallScore,
      };
      points.push(chartPoint);
      if (p.bankName) {
        this.bankByPoint[label] = p.bankName;
        this.fechaByPoint[label] = this.formatFechaHora(p.completedAt);
      }
    });
    const serie: ChartSerie = { name: 'Score', series: points };
    this.scoreOverTimeData = [serie];
    this.scoreOverTimeData = this.scoreOverTimeData.slice();
  }

  formatFechaHora(iso: string): string {
    if (!iso) return '';
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun',
                  'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const d = new Date(iso);
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    return d.getDate() + ' ' + meses[d.getMonth()] + ' ' + d.getFullYear() + ', ' + hh + ':' + mm;
  }

  tooltipTexto(model: any): string {
    const banco = this.bankByPoint[model.name];
    const fecha = this.fechaByPoint[model.name];
    let texto = '';
    if (banco) {
      texto += banco + ' · ';
    }
    texto += 'Score ' + model.value;
    if (fecha) {
      texto += ' · ' + fecha;
    }
    return texto;
  }

  IniciarNuevaSimulacion() {
    this.router.navigate(['/applicant/simulations']);
  }
}