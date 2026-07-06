import { ChangeDetectorRef, Component } from '@angular/core';
import { QuestionBankSummaryResponseDTO } from '../../../models/questionBankSummaryResponseDTO';
import { QuestionBankService } from '../../../services/question-bank-service';
import { SimulationService } from '../../../services/simulation-service';
import { NavigationEnd, Router } from '@angular/router';
import { SimulationResponseDTO } from '../../../models/simulationResponseDTO';
import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-list-simulations',
  standalone: false,
  templateUrl: './list-simulations.html',
  styleUrl: './list-simulations.css',
})
export class ListSimulations {
  loading: boolean = true;
  starting: boolean = false;

  allBanks: QuestionBankSummaryResponseDTO[] = [];
  banks: QuestionBankSummaryResponseDTO[] = [];

  // banco selec
  selectedBank: QuestionBankSummaryResponseDTO | null = null;

  // filtros
  searchText: string = '';
  filter: string = 'all';

  constructor(private questionBankService: QuestionBankService,
              private simulationService: SimulationService,
              private router: Router,
              private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarBancos();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (event.url.includes('/applicant/simulations') && !event.url.includes('/run') && !event.url.includes('/report')) {
        this.cargarBancos();
      }
    });
  }

  cargarBancos() {
    this.loading = true;
    this.questionBankService.listForApplicant(this.filter).subscribe({
      next: (data: QuestionBankSummaryResponseDTO[]) => {
        this.allBanks = data;
        this.aplicarBusqueda();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.loading = false;
      }
    });
  }

  aplicarBusqueda() {
    const texto = this.searchText.toLowerCase().trim();
    this.banks = this.allBanks.filter(b => {
      return texto === '' ||
        b.name.toLowerCase().includes(texto) ||
        (b.companyName && b.companyName.toLowerCase().includes(texto));
    });
  }

  CambiarFiltro(nuevoFilter: string) {
    this.filter = nuevoFilter;
    this.selectedBank = null;
    this.cargarBancos();
  }

  SeleccionarBanco(bank: QuestionBankSummaryResponseDTO) {
    this.selectedBank = bank;
  }

  CerrarPanel() {
    this.selectedBank = null;
  }

  tiempoEstimado(numQuestions: number): number {
    return Math.round(numQuestions * 2.5);
  }

  bancoEnProgreso(): boolean {
    return this.selectedBank !== null && this.selectedBank.status === 'IN_PROGRESS';
  }

  bancoCompletado(): boolean {
    return this.selectedBank !== null && this.selectedBank.status === 'COMPLETED';
  }

  estadoBanco(status: string): string {
    return status;
  }

  IniciarSimulacion() {
    if (!this.selectedBank) return;
    this.starting = true;

    const request = {
      questionBankId: this.selectedBank.id,
      confirmAbandonPrevious: this.bancoEnProgreso()
    };

    this.simulationService.start(request).subscribe({
      next: (data: SimulationResponseDTO) => {
        this.router.navigate(['/applicant/simulations', data.simulationId, 'run'], {
          queryParams: { bankId: this.selectedBank!.id }
        });
      },
      error: (err) => {
        console.log(err);
        this.starting = false;
      }
    });
  }

  ContinuarSimulacion() {
    if (!this.selectedBank) return;
    this.router.navigate(['/applicant/simulations', 0, 'run'], {
      queryParams: { bankId: this.selectedBank.id }
    });
  }

  EmpezarDeNuevo() {
    this.IniciarSimulacion();
  }
}