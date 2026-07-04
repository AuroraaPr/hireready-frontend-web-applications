import { ChangeDetectorRef, Component } from '@angular/core';
import { QuestionBankResponseDTO } from '../../../models/questionBankResponseDTO';
import { DetailBank } from '../../shared/detail-bank/detail-bank';
import { MatDialog } from '@angular/material/dialog';
import { QuestionBankService } from '../../../services/question-bank-service';
import { QuestionBankSummaryResponseDTO } from '../../../models/questionBankSummaryResponseDTO';

@Component({
  selector: 'app-list-banks-company',
  standalone: false,
  templateUrl: './list-banks-company.html',
  styleUrl: './list-banks-company.css',
})
export class ListBanksCompany {

  loading: boolean = true;

  allBanks: QuestionBankSummaryResponseDTO[] = [];
  banks: QuestionBankSummaryResponseDTO[] = [];

  levels: string[] = [];

  searchText: string = '';
  selectedLevel: string = '';

  constructor(private questionBankService: QuestionBankService,
              private dialog: MatDialog,
              private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.questionBankService.listForCompany().subscribe({
      next: (data: QuestionBankSummaryResponseDTO[]) => {
        this.allBanks = data;
        this.banks = data;
        this.extraerOpciones(data);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.loading = false;
      }
    });
  }

  extraerOpciones(data: QuestionBankSummaryResponseDTO[]) {
    const levelSet = new Set<string>();
    data.forEach(b => {
      if (b.level) levelSet.add(b.level);
    });
    this.levels = Array.from(levelSet);
  }

  aplicarFiltros() {
    const texto = this.searchText.toLowerCase().trim();

    this.banks = this.allBanks.filter(b => {
      // buscador
      const coincideTexto = texto === '' ||
        b.name.toLowerCase().includes(texto) ||
        (b.jobPosition && b.jobPosition.toLowerCase().includes(texto));

      const coincideNivel = this.selectedLevel === '' ||
        b.level === this.selectedLevel;

      return coincideTexto && coincideNivel;
    });
  }

  esActivo(status: string): boolean {
    return status === 'ACTIVE';
  }

  VerDetalle(bankId: number) {
    this.questionBankService.getByIdForCompany(bankId).subscribe({
      next: (bank: QuestionBankResponseDTO) => {
        this.dialog.open(DetailBank, {
          data: bank,
          width: '640px',
          maxWidth: '92vw',
          autoFocus: false,
        });
      },
      error: (err) => { console.log(err); }
    });
  }
}
