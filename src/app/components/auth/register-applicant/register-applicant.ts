import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { ApplicantService } from '../../../services/applicant-service';
import { CareerService } from '../../../services/career-service';
import { UserService } from '../../../services/user-service';
import { UniversityService } from '../../../services/university-service';
import { UniversityApiResult } from '../../../models/universityApiResult';
import { CareerResponseDTO } from '../../../models/careerResponseDTO';
import { RegisterApplicantRequestDTO } from '../../../models/registerApplicantRequestDTO';
import { LoginRequestDTO } from '../../../models/loginRequestDTO';
import { LevelStudyOption } from '../../../models/levelStudyOption';

function bornDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const raw = ((control.value as string) || '').trim();
    if (!raw) return null; // el required ya se encarga de esto
 
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(raw);
    if (!match) return { invalidDate: true };
 
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const date = new Date(year, month - 1, day);
 
    const esFechaReal =
      date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
    const noEsFutura = date.getTime() <= Date.now();
    const anioRazonable = year >= 1930;
 
    return esFechaReal && noEsFutura && anioRazonable ? null : { invalidDate: true };
  };
}

@Component({
  selector: 'app-register-applicant',
  standalone: false,
  templateUrl: './register-applicant.html',
  styleUrl: './register-applicant.css',
})
export class RegisterApplicant implements OnInit, OnDestroy {
  form!: FormGroup;
  hidePassword: boolean = true;
  saving: boolean = false;
 
  errorMessage: string = '';
  successMessage: string = '';
 
  careers: CareerResponseDTO[] = [];
  loadingCareers: boolean = true;
 
  universitySuggestions: UniversityApiResult[] = [];
  searchingUniversity: boolean = false;

  private selectedUniversityName: string = '';
 
  readonly levelsOfStudy: LevelStudyOption[] = [
    { value: 'Secundaria completa', label: 'Secundaria completa' },
    { value: 'Certificación técnica', label: 'Certificación técnica' },
    { value: 'Curso especializado', label: 'Curso especializado' },
    { value: 'Bootcamp', label: 'Bootcamp' },
    { value: 'Pregrado (ciclos 1 al 3)', label: 'Pregrado (ciclos 1 al 3)' },
    { value: 'Pregrado (ciclos 4 al 6)', label: 'Pregrado (ciclos 4 al 6)' },
    { value: 'Pregrado (ciclos 7 al 10)', label: 'Pregrado (ciclos 7 al 10)' },
    { value: 'Egresado', label: 'Egresado' },
    { value: 'Diplomado', label: 'Diplomado' },
    { value: 'Maestría', label: 'Maestría' },
    { value: 'Doctorado', label: 'Doctorado' },
  ];
 
  private universitySearch$ = new Subject<string>();
  private destroy$ = new Subject<void>();
 
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private applicantService: ApplicantService,
    private careerService: CareerService,
    private userService: UserService,
    private universityService: UniversityService,
  ) {}
 
  ngOnInit(): void {
    this.buildForm();
    this.loadCareers();
    this.setupUniversitySearch();
  }
 
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
 
  buildForm(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      name: ['', Validators.required],
      bornDate: ['', [Validators.required, bornDateValidator()]],
      careerId: [null, Validators.required],
      levelStudy: ['', Validators.required],
      university: ['', this.universityFromApiValidator()],
    });
  }
 
  get emailControl(): AbstractControl {
    return this.form.get('email')!;
  }
  get passwordControl(): AbstractControl {
    return this.form.get('password')!;
  }
  get nameControl(): AbstractControl {
    return this.form.get('name')!;
  }
  get bornDateControl(): AbstractControl {
    return this.form.get('bornDate')!;
  }
  get careerIdControl(): AbstractControl {
    return this.form.get('careerId')!;
  }
  get levelStudyControl(): AbstractControl {
    return this.form.get('levelStudy')!;
  }
  get universityControl(): AbstractControl {
    return this.form.get('university')!;
  }
  
  loadCareers(): void {
    this.loadingCareers = true;
    this.careerService.listPublic().subscribe({
      next: (data) => {
        this.careers = data;
        this.loadingCareers = false;
      },
      error: () => {
        this.loadingCareers = false;
      },
    });
  }
  
  onBornDateInput(rawValue: string): void {
    const digits = rawValue.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    } else if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    this.bornDateControl.setValue(formatted);
    this.clearFeedback();
  }
  
  setupUniversitySearch(): void {
    this.universitySearch$
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        switchMap((term) => {
          if (term.trim().length < 3) {
            this.searchingUniversity = false;
            return of([]);
          }
          this.searchingUniversity = true;
          return this.universityService.search(term);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((results) => {
        this.universitySuggestions = results.slice(0, 6);
        this.searchingUniversity = false;
      });
  }
 
  onUniversityInput(value: string): void {
    this.clearFeedback();
    if (value.trim() !== this.selectedUniversityName) {
      this.selectedUniversityName = '';
    }
    this.universityControl.updateValueAndValidity();
    this.universitySearch$.next(value);
  }
 
  onUniversityFocus(): void {
    const current = (this.universityControl.value as string) || '';
    if (current.trim().length >= 3) {
      this.universitySearch$.next(current);
    }
  }
 
  onUniversityBlur(): void {
    setTimeout(() => {
      this.universitySuggestions = [];
    }, 150);
  }
 
  selectUniversity(university: UniversityApiResult): void {
    this.selectedUniversityName = university.name;
    this.universityControl.setValue(university.name);
    this.universityControl.updateValueAndValidity();
    this.universitySuggestions = [];
  }

  private universityFromApiValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = ((control.value as string) || '').trim();
      if (!value) return null; 
      return value === this.selectedUniversityName ? null : { universityNotSelected: true };
    };
  }
 
  splitMatch(name: string): { before: string; match: string; after: string } {
    const term = ((this.universityControl.value as string) || '').trim();
    if (!term) return { before: '', match: '', after: name };
 
    const idx = name.toLowerCase().indexOf(term.toLowerCase());
    if (idx === -1) return { before: '', match: '', after: name };
 
    return {
      before: name.substring(0, idx),
      match: name.substring(idx, idx + term.length),
      after: name.substring(idx + term.length),
    };
  }
  
  goToCompanyRegister(): void {
    this.router.navigate(['/register/company']);
  }
  
  clearFeedback(): void {
    if (this.errorMessage) this.errorMessage = '';
  }
  
  private parseBornDateToIso(value: string): string {
    const [day, month, year] = value.trim().split('/');
    return `${year}-${month}-${day}`;
  }
 
  register(): void {
    if (this.saving) return;
 
    this.errorMessage = '';
    this.successMessage = '';
 
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.universityControl.hasError('universityNotSelected')) {
        this.errorMessage = 'Selecciona tu universidad de la lista de sugerencias, o deja el campo vacío.';
      } else {
        this.errorMessage = 'Completa todos los campos obligatorios';
      }
      return;
    }
 
    this.saving = true;
 
    const dto: RegisterApplicantRequestDTO = {
      email: (this.emailControl.value as string).trim(),
      password: this.passwordControl.value as string,
      name: (this.nameControl.value as string).trim(),
      bornDate: this.parseBornDateToIso(this.bornDateControl.value as string),
      careerId: this.careerIdControl.value as number,
      levelStudy: this.levelStudyControl.value as string,
      university: ((this.universityControl.value as string) || '').trim(),
    };
 
    this.applicantService.register(dto).subscribe({
      next: () => this.loginAfterRegister(dto.email, dto.password),
      error: (err) => {
        this.saving = false;
        if (err?.status === 409) {
          this.emailControl.setErrors({ conflict: true });
          this.errorMessage = 'Correo ya registrado anteriormente';
        } else {
          this.errorMessage = 'No se pudo registrar la cuenta. Intenta nuevamente.';
        }
      },
    });
  }
 
  private loginAfterRegister(email: string, password: string): void {
    const loginDto: LoginRequestDTO = { email, password };
 
    this.userService.login(loginDto).subscribe({
      next: () => {
        this.successMessage = '¡Cuenta registrada correctamente!';
        setTimeout(() => {
          this.router.navigate(['/applicant/dashboard']);
        }, 1800);
      },
      error: () => {
        this.saving = false;
        this.successMessage = '¡Cuenta registrada correctamente!';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1800);
      },
    });
  }
}