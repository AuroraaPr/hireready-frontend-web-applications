import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CompanyService } from '../../../services/company-service';
import { UserService } from '../../../services/user-service';
import { RegisterCompanyRequestDTO } from '../../../models/registerCompanyRequestDTO';
import { LoginRequestDTO } from '../../../models/loginRequestDTO';

@Component({
  selector: 'app-register-company',
  standalone: false,
  templateUrl: './register-company.html',
  styleUrl: './register-company.css',
})
export class RegisterCompany {
  form: FormGroup;
 
  hidePassword: boolean = true;
  saving: boolean = false;
 
  errorMessage: string = '';
  successMessage: string = '';
 
  readonly descriptionMaxLength = 500;
 
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private companyService: CompanyService,
    private userService: UserService,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      name: ['', Validators.required],
      description: ['', [Validators.required, Validators.maxLength(this.descriptionMaxLength)]],
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
  get descriptionControl(): AbstractControl {
    return this.form.get('description')!;
  }
  
  goToApplicantRegister(): void {
    this.router.navigate(['/register/applicant']);
  }
  
  clearFeedback(): void {
    if (this.errorMessage) this.errorMessage = '';
  }
  
  register(): void {
    if (this.saving) return;
 
    this.errorMessage = '';
    this.successMessage = '';
 
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Completa todos los campos obligatorios';
      return;
    }
 
    this.saving = true;
 
    const dto: RegisterCompanyRequestDTO = {
      email: (this.emailControl.value as string).trim(),
      password: this.passwordControl.value as string,
      name: (this.nameControl.value as string).trim(),
      description: (this.descriptionControl.value as string).trim(),
    };
 
    this.companyService.register(dto).subscribe({
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
          this.router.navigate(['/company/dashboard']);
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