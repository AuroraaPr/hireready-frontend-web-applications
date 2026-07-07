import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CareerService } from '../../../services/career-service';
import { CareerResponseDTO } from '../../../models/careerResponseDTO';

@Component({
  selector: 'app-list-careers',
  standalone: false,
  templateUrl: './list-careers.html',
  styleUrl: './list-careers.css',
})
export class ListCareers implements OnInit {
  loading: boolean = true;
  error: boolean = false;
  saving: boolean = false;

  careers: CareerResponseDTO[] = [];
  sortedCareers: CareerResponseDTO[] = [];
  sortAsc: boolean = true;

  newCareerName: string = '';

  editingId: number | null = null;
  editingName: string = '';

  constructor(
    private careerService: CareerService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = false;
    this.careerService.list().subscribe({
      next: (data) => {
        this.careers = data;
        this.applySort();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.error = true;
        this.cdr.detectChanges();
      },
    });
  }

  applySort(): void {
    this.sortedCareers = [...this.careers].sort((a, b) =>
      this.sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
    );
  }

  toggleSort(): void {
    this.sortAsc = !this.sortAsc;
    this.applySort();
  }

  addCareer(): void {
    const name = this.newCareerName.trim();
    if (name.length === 0 || this.saving) return;

    const yaExiste = this.careers.some((c) => c.name.toLowerCase() === name.toLowerCase());
    if (yaExiste) {
      this.snackBar.open('Ya existe una carrera con ese nombre', 'Cerrar', {
        duration: 3000,
        panelClass: 'snackbar-error',
      });
      return;
    }

    this.saving = true;
    this.careerService.add({ name }).subscribe({
      next: (created) => {
        this.careers = [...this.careers, created];
        this.applySort();
        this.newCareerName = '';
        this.saving = false;
        this.cdr.detectChanges();
        this.snackBar.open('Carrera agregada correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: 'snackbar-success',
        });
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('No se pudo agregar la carrera', 'Cerrar', {
          duration: 3500,
          panelClass: 'snackbar-error',
        });
      },
    });
  }

  startEdit(career: CareerResponseDTO): void {
    this.editingId = career.id;
    this.editingName = career.name;
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editingName = '';
  }

  saveEdit(career: CareerResponseDTO): void {
    const name = this.editingName.trim();
    if (name.length === 0 || this.saving) return;

    if (name === career.name) {
      this.cancelEdit();
      return;
    }

    this.saving = true;
    this.careerService.update(career.id, { name }).subscribe({
      next: (updated) => {
        const idx = this.careers.findIndex((c) => c.id === career.id);
        if (idx !== -1) this.careers[idx] = updated;
        this.applySort();
        this.saving = false;
        this.cancelEdit();
        this.cdr.detectChanges();
        this.snackBar.open('Carrera actualizada correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: 'snackbar-success',
        });
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('No se pudo actualizar la carrera', 'Cerrar', {
          duration: 3500,
          panelClass: 'snackbar-error',
        });
      },
    });
  }
}