import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TokenResponseDTO } from '../models/tokenResponseDTO';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequestDTO } from '../models/loginRequestDTO';
import { UserStatusResponseDTO } from '../models/userStatusResponseDTO';
import { AuthorityRole } from '../models/authorityRole';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  ruta_servidor: string = 'http://localhost:8080/hireready';
  recurso: string = 'users';

  private nameSubject = new BehaviorSubject<string>(localStorage.getItem('name') || '');
  name$: Observable<string> = this.nameSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(dto: LoginRequestDTO){
    
    this.logout();
    
    return this.http.post<TokenResponseDTO>(this.ruta_servidor + '/login', dto).pipe(
      tap((data: TokenResponseDTO) =>{
        localStorage.setItem('jwt', data.jwt);
        localStorage.setItem('userId', String(data.userId));
        localStorage.setItem('email', data.email);
        localStorage.setItem('name', data.name);
        this.nameSubject.next(data.name);
        localStorage.setItem('role', data.role);
        if (data.applicantId !== null) localStorage.setItem('applicantId', String(data.applicantId));
        if (data.companyId !== null) localStorage.setItem('companyId', String(data.companyId));
      }),
    );
  }

  logout(){
    localStorage.clear();
  }

  getJwtTokenLogeado(){
    return localStorage.getItem('jwt');
  }

  getUserIdLogeado() {
    return localStorage.getItem('userId');
  }

  getEmailLogeado() {
    return localStorage.getItem('email');
  }

   getNameLogeado() {
  return localStorage.getItem('name');
  }

  setNameLogeado(name: string) {
    localStorage.setItem('name', name);
    this.nameSubject.next(name);
  }

  getRoleLogeado() {
    return localStorage.getItem('role') as AuthorityRole | null;
  }

  getApplicantIdLogeado() {
    const existe = localStorage.getItem('applicantId');
    return existe ? Number(existe) : null;
  }

  getCompanyIdLogeado() {
    const existe = localStorage.getItem('companyId');
    return existe ? Number(existe) : null;
  }

  estaLogueado() {
    return this.getJwtTokenLogeado() !== null;
  }

  esApplicant(){ 
    return this.getRoleLogeado() === 'APPLICANT'; 
  }

  esCompany(){ 
    return this.getRoleLogeado() === 'COMPANY'; 
  }

  esAdmin(){ 
    return this.getRoleLogeado() === 'ADMIN'; 
  }

  // para admin

  desactivate(targetUserId: number){
    return this.http.post<UserStatusResponseDTO>(this.ruta_servidor+'/admin/'+this.recurso+'/'+targetUserId+'/deactivate',{});
  }

  activate(targetUserId: number){
    return this.http.post<UserStatusResponseDTO>(this.ruta_servidor+'/admin/'+this.recurso+'/'+targetUserId+'/activate', {});
  }

}