import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { QuestionBankService } from '../../../services/question-bank-service';
import { CareerService } from '../../../services/career-service';
import { CompanyService } from '../../../services/company-service';
import { CareerResponseDTO } from '../../../models/careerResponseDTO';
import { CreateQuestionBankRequestDTO } from '../../../models/createQuestionBankRequestDTO';
import { LevelOption } from '../../../models/levelOption';
 
function minSelectionValidator(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value as unknown[]) || [];
    return value.length >= min ? null : { minSelection: { required: min, actual: value.length } };
  };
}

@Component({
  selector: 'app-save-bank-company',
  standalone: false,
  templateUrl: './save-bank-company.html',
  styleUrl: './save-bank-company.css',
})
export class SaveBankCompany implements OnInit {

  form!: FormGroup;
 
  companyName: string = '';
 
  loadingCareers: boolean = true;
  errorCareers: boolean = false;
  allCareers: CareerResponseDTO[] = [];
 
  saving: boolean = false;
 
  editingIndex: number | null = null;
 
  readonly descriptionMaxLength = 500;
  readonly recommendedMin = 8;
  readonly recommendedMax = 12;
 
  readonly levels: LevelOption[] = [
    { value: 'Sin experiencia', label: 'Sin experiencia' },
    { value: 'Practicante', label: 'Practicante' },
    { value: 'Junior', label: 'Junior' },
    { value: 'Semi Senior', label: 'Semi Senior' },
    { value: 'Senior', label: 'Senior' },
  ];
 
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private questionBankService: QuestionBankService,
    private careerService: CareerService,
    private companyService: CompanyService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadCareers();
    this.loadCompany();
  }

  buildForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
      jobPosition: ['', [Validators.required, Validators.maxLength(120)]],
      description: ['', [Validators.required, Validators.maxLength(this.descriptionMaxLength)]],
      level: ['Junior', Validators.required],
      careerIds: this.fb.control<number[]>([], [minSelectionValidator(1)]),
      questions: new FormArray<FormControl<string>>([]),
    });
  }
  
  get nameControl(): AbstractControl {
    return this.form.get('name')!;
  }
 
  get jobPositionControl(): AbstractControl {
    return this.form.get('jobPosition')!;
  }
 
  get descriptionControl(): AbstractControl {
    return this.form.get('description')!;
  }
 
  get levelControl(): AbstractControl {
    return this.form.get('level')!;
  }
 
  get careerIdsControl(): AbstractControl {
    return this.form.get('careerIds')!;
  }
 
  get questionsArray(): FormArray<FormControl<string>> {
    return this.form.get('questions') as FormArray<FormControl<string>>;
  }
 
  get selectedCareerIds(): number[] {
    return (this.careerIdsControl.value as number[]) || [];
  }
 
  get selectedCareers(): CareerResponseDTO[] {
    return this.allCareers.filter((c) => this.selectedCareerIds.includes(c.id));
  }
 
  get unselectedCareers(): CareerResponseDTO[] {
    return this.allCareers.filter((c) => !this.selectedCareerIds.includes(c.id));
  }
  
  loadCareers(): void {
    this.loadingCareers = true;
    this.errorCareers = false;
    this.careerService.listPublic().subscribe({
      next: (data) => {
        this.allCareers = data;
        this.loadingCareers = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingCareers = false;
        this.errorCareers = true;
        this.cdr.detectChanges();
      },
    });
  }
 
  loadCompany(): void {
    this.companyService.getMe().subscribe({
      next: (data) => {
        this.companyName = data.name;
        this.cdr.detectChanges();
      },
      error: () => {

      },
    });
  }
  
  toggleCareer(career: CareerResponseDTO): void {
    const current = [...this.selectedCareerIds];
    const idx = current.indexOf(career.id);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(career.id);
    }
    this.careerIdsControl.setValue(current);
    this.careerIdsControl.markAsTouched();
  }
 
  removeCareer(career: CareerResponseDTO): void {
    this.careerIdsControl.setValue(this.selectedCareerIds.filter((id) => id !== career.id));
    this.careerIdsControl.markAsTouched();
  }
 
  selectLevel(value: string): void {
    this.levelControl.setValue(value);
  }
  
  addQuestion(): void {
    const hayVacia = this.questionsArray.controls.some(
      (c) => ((c.value as string) || '').trim().length === 0
    );
    if (hayVacia) {
      const idxVacia = this.questionsArray.controls.findIndex(
        (c) => ((c.value as string) || '').trim().length === 0
      );
      this.editingIndex = idxVacia;
      this.snackBar.open('Completa la pregunta vacía antes de agregar otra.', 'Cerrar', {
        duration: 3000,
        panelClass: 'snackbar-error',
      });
      return;
    }
    const control = new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(500)],
    });
    this.questionsArray.push(control);
    this.editingIndex = this.questionsArray.length - 1;
  }

  get tiempoEstimado(): number {
    return Math.max(1, Math.round(this.questionsArray.length * 2.5));
  }

  esPreguntaVacia(index: number): boolean {
    const c = this.questionsArray.at(index);
    return ((c?.value as string) || '').trim().length === 0;
  }
 
  editQuestion(index: number): void {
    this.editingIndex = index;
  }
 
  confirmQuestion(index: number): void {
    const control = this.questionsArray.at(index);
    control.markAsTouched();
    if (control.invalid) return;
    if (this.editingIndex === index) this.editingIndex = null;
  }
 
  removeQuestion(index: number): void {
    this.questionsArray.removeAt(index);
    if (this.editingIndex === index) this.editingIndex = null;
  }
 
  onDropQuestion(event: CdkDragDrop<FormControl<string>[]>): void {
    moveItemInArray(this.questionsArray.controls, event.previousIndex, event.currentIndex);
    this.questionsArray.updateValueAndValidity();
    this.editingIndex = null;
  }
 
  get questionsToRecommendedCount(): number {
    return Math.max(0, this.recommendedMin - this.questionsArray.length);
  }
 
  get isWithinRecommendedRange(): boolean {
    const n = this.questionsArray.length;
    return n >= this.recommendedMin && n <= this.recommendedMax;
  }
  
  get hasName(): boolean {
    return this.nameControl.valid && ((this.nameControl.value as string) || '').trim().length > 0;
  }
 
  get hasJobPosition(): boolean {
    return this.jobPositionControl.valid && ((this.jobPositionControl.value as string) || '').trim().length > 0;
  }
 
  get hasLevel(): boolean {
    return !!this.levelControl.value;
  }
 
  get hasAtLeastOneCareer(): boolean {
    return this.selectedCareerIds.length > 0;
  }
 
  get hasAtLeastOneQuestion(): boolean {
    return this.questionsArray.length > 0;
  }

  get allQuestionsHaveContent(): boolean {
    return this.questionsArray.controls.every(
      (c) => ((c.value as string) || '').trim().length > 0
    );
  }
 
  get canPublish(): boolean {
    return (
      this.hasName &&
      this.hasJobPosition &&
      this.descriptionControl.valid &&
      this.hasLevel &&
      this.hasAtLeastOneCareer &&
      this.hasAtLeastOneQuestion &&
      this.allQuestionsHaveContent &&
      !this.saving
    );
  }
 
  cancel(): void {
    this.router.navigate(['/company/banks']);
  }
 
  publish(): void {
    this.form.markAllAsTouched();
    this.careerIdsControl.markAsTouched();
    this.questionsArray.controls.forEach((c) => c.markAsTouched());
 
    if (!this.canPublish) {
      const msg = this.hasAtLeastOneQuestion && !this.allQuestionsHaveContent
        ? 'Hay preguntas vacías. Escribe el contenido de cada pregunta o elimínala.'
        : 'Completa los campos requeridos antes de publicar el banco.';
      this.snackBar.open(msg, 'Cerrar', {
        duration: 3500,
        panelClass: 'snackbar-error',
      });
      return;
    }
 
    this.saving = true;
 
    const dto: CreateQuestionBankRequestDTO = {
      name: (this.nameControl.value as string).trim(),
      description: (this.descriptionControl.value as string).trim(),
      jobPosition: (this.jobPositionControl.value as string).trim(),
      level: this.levelControl.value as string,
      careerIds: this.selectedCareerIds,
      questions: this.questionsArray.controls.map((control, index) => ({
        content: (control.value || '').trim(),
        orderIndex: index + 1,
      })),
    };
 
    this.questionBankService.create(dto).subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open('Banco de preguntas publicado correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: 'snackbar-success',
        });
        this.router.navigate(['/company/banks']);
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('No se pudo publicar el banco de preguntas. Intenta nuevamente.', 'Cerrar', {
          duration: 4000,
          panelClass: 'snackbar-error',
        });
      },
    });
  }
}