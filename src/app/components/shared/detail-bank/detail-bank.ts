import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { QuestionBankResponseDTO } from '../../../models/questionBankResponseDTO';

@Component({
  selector: 'app-detail-bank',
  standalone: false,
  templateUrl: './detail-bank.html',
  styleUrl: './detail-bank.css',
})
export class DetailBank {
  constructor(@Inject(MAT_DIALOG_DATA) public bank: QuestionBankResponseDTO,
              public dialogRef: MatDialogRef<DetailBank>) {}

  Cerrar() {
    this.dialogRef.close();
  }
}
