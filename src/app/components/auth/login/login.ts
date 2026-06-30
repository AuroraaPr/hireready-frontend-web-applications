import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../services/user-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { LoginRequestDTO } from '../../../models/loginRequestDTO';
import { TokenResponseDTO } from '../../../models/tokenResponseDTO';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm!: FormGroup;
  loading: boolean = false;
  hidePassword: boolean = true;

  constructor(private userService: UserService,
              private formBuilder: FormBuilder,
              private snackBar: MatSnackBar,
              private router: Router) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]],
    });
  }

  Login() {
    if (this.loading) return;

    const dto: LoginRequestDTO = {
      email: this.loginForm.get("email")?.value,
      password: this.loginForm.get("password")?.value,
    };

    if (this.loginForm.valid) {
      this.loading = true;
      this.userService.login(dto).subscribe({
        next: (data: TokenResponseDTO) => {
          this.loading = false;
          if (this.userService.esApplicant()) {
            this.router.navigate(['/applicant/dashboard']);
          } else if (this.userService.esCompany()) {
            this.router.navigate(['/company/dashboard']);
          } else if (this.userService.esAdmin()) {
            this.router.navigate(['/admin/dashboard']);
          }
        },
        error: (err) => {
          this.loading = false;
          console.log(err);
          this.snackBar.open(
            'Credenciales inválidas o cuenta desactivada',
            'Cerrar',
            { duration: 4000, panelClass: 'snackbar-error' },
          );
        },
      });
    }
  }
}
