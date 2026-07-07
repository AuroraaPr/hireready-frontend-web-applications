import { ChangeDetectorRef, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { QuestionBankResponseDTO } from '../../../models/questionBankResponseDTO';
import { QuestionBankService } from '../../../services/question-bank-service';
import { DetailBank } from '../../shared/detail-bank/detail-bank';
import { QuestionBankAdminSummaryResponseDTO } from '../../../models/questionBankAdminSummaryResponseDTO';

@Component({
  selector: 'app-list-banks-admin',
  standalone: false,
  templateUrl: './list-banks-admin.html',
  styleUrl: './list-banks-admin.css',
})
export class ListBanksAdmin {

  loading: boolean = true;

  // beckend data
  allBanks: QuestionBankAdminSummaryResponseDTO[] = [];
  // lista filtrada
  banks: QuestionBankAdminSummaryResponseDTO[] = [];

  // filtros
  companies: string[] = [];
  levels: string[] = [];

  searchText: string = '';
  selectedCompany: string = '';
  selectedLevel: string = '';
  selectedCompanyStatus: string = '';

  constructor(private questionBankService: QuestionBankService,
              private dialog: MatDialog,
              private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.questionBankService.listForAdmin().subscribe({
      next: (data: QuestionBankAdminSummaryResponseDTO[]) => {
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

  extraerOpciones(data: QuestionBankAdminSummaryResponseDTO[]) {
    const companySet = new Set<string>();
    const levelSet = new Set<string>();
    data.forEach(b => {
      if (b.companyName) companySet.add(b.companyName);
      if (b.level) levelSet.add(b.level);
    });
    this.companies = Array.from(companySet);
    this.levels = Array.from(levelSet);
  }

  aplicarFiltros() {
    const texto = this.searchText.toLowerCase().trim();

    this.banks = this.allBanks.filter(b => {
      // buscador
      const coincideTexto = texto === '' ||
        b.name.toLowerCase().includes(texto) ||
        (b.companyName && b.companyName.toLowerCase().includes(texto));

      // filtro empresa
      const coincideEmpresa = this.selectedCompany === '' ||
        b.companyName === this.selectedCompany;

      // filtro nivel
      const coincideNivel = this.selectedLevel === '' ||
        b.level === this.selectedLevel;

      // filtro por estado de empresa
      const coincideEstadoEmpresa = this.selectedCompanyStatus === '' ||
        (this.selectedCompanyStatus === 'active' && b.companyEnabled) ||
        (this.selectedCompanyStatus === 'inactive' && !b.companyEnabled);

      return coincideTexto && coincideEmpresa && coincideNivel && coincideEstadoEmpresa;
    });
  }
  
  VerDetalle(bankId: number) {
    this.questionBankService.getByIdForAdmin(bankId).subscribe({
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