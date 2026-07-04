import { ChangeDetectorRef, Component } from '@angular/core';
import { QuestionBankSummaryResponseDTO } from '../../../models/questionBankSummaryResponseDTO';
import { ContinueSimulationResponseDTO } from '../../../models/continueSimulationResponseDTO';
import { QuestionBankService } from '../../../services/question-bank-service';
import { SimulationService } from '../../../services/simulation-service';
import { Router } from '@angular/router';
import { SimulationResponseDTO } from '../../../models/simulationResponseDTO';

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

  // sim "IN_PROGRESS"
  currentSimulation: ContinueSimulationResponseDTO | null = null;

  // filtros
  searchText: string = '';
  filter: string = 'all';

  constructor(private questionBankService: QuestionBankService,
              private simulationService: SimulationService,
              private router: Router,
              private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarSimulacionEnProgreso();
    this.cargarBancos();
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

  cargarSimulacionEnProgreso() {
    this.simulationService.getCurrent().subscribe({
      next: (data: ContinueSimulationResponseDTO) => {
        if (data && data.simulationId && data.status === 'IN_PROGRESS') {
          this.currentSimulation = data;
        } else {
          this.currentSimulation = null;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.currentSimulation = null;
        this.cdr.detectChanges();
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
      confirmAbandonPrevious: this.currentSimulation !== null  // abandona
    };

    this.simulationService.start(request).subscribe({
      next: (data: SimulationResponseDTO) => {
        this.router.navigate(['/applicant/simulation', data.simulationId]);
      },
      error: (err) => {
        console.log(err);
        this.starting = false;
      }
    });
  }
  ContinuarSimulacion() {
    if (!this.currentSimulation) return;
    this.router.navigate(['/applicant/simulation', this.currentSimulation.simulationId]);
  }

  EmpezarDeNuevo() {
    this.IniciarSimulacion();
  }
}
