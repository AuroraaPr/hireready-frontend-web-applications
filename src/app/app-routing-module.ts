import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './components/auth/login/login';
import { RegisterApplicant } from './components/auth/register-applicant/register-applicant';
import { RegisterCompany } from './components/auth/register-company/register-company';
import { DashboardApplicant } from './components/applicant/dashboard-applicant/dashboard-applicant';
import { ListSimulations } from './components/applicant/list-simulations/list-simulations';
import { RunSimulation } from './components/applicant/run-simulation/run-simulation';
import { ReportSimulation } from './components/applicant/report-simulation/report-simulation';
import { ListHistory } from './components/applicant/list-history/list-history';
import { SaveProfileApplicant } from './components/applicant/save-profile-applicant/save-profile-applicant';
import { DashboardCompany } from './components/company/dashboard-company/dashboard-company';
import { ListBanksCompany } from './components/company/list-banks-company/list-banks-company';
import { SaveBankCompany } from './components/company/save-bank-company/save-bank-company';
import { SaveProfileCompany } from './components/company/save-profile-company/save-profile-company';
import { DashboardAdmin } from './components/admin/dashboard-admin/dashboard-admin';
import { ListApplicants } from './components/admin/list-applicants/list-applicants';
import { ListCompanies } from './components/admin/list-companies/list-companies';
import { ListBanksAdmin } from './components/admin/list-banks-admin/list-banks-admin';
import { DetailBankAdmin } from './components/admin/detail-bank-admin/detail-bank-admin';
import { ListCareers } from './components/admin/list-careers/list-careers';
import { applicantGuard } from './guards/applicant-guard';
import { companyGuard } from './guards/company-guard';
import { adminGuard } from './guards/admin-guard';

const routes: Routes = [

  { path: '', component: Login },
  { path: 'login', component: Login },
  { path: 'register/applicant', component: RegisterApplicant },
  { path: 'register/company', component: RegisterCompany },

  // applicant
  { path: 'applicant/dashboard', component: DashboardApplicant, canActivate: [applicantGuard] },
  { path: 'applicant/simulations', component: ListSimulations, canActivate: [applicantGuard] },
  { path: 'applicant/simulations/:id/run', component: RunSimulation, canActivate: [applicantGuard] },
  { path: 'applicant/simulations/:id/report', component: ReportSimulation, canActivate: [applicantGuard] },
  { path: 'applicant/history', component: ListHistory, canActivate: [applicantGuard] },
  { path: 'applicant/profile', component: SaveProfileApplicant, canActivate: [applicantGuard] },

  // company
  { path: 'company/dashboard', component: DashboardCompany, canActivate: [companyGuard] },
  { path: 'company/banks', component: ListBanksCompany, canActivate: [companyGuard] },
  { path: 'company/banks/new', component: SaveBankCompany, canActivate: [companyGuard] },
  { path: 'company/profile', component: SaveProfileCompany, canActivate: [companyGuard] },

  // admin
  { path: 'admin/dashboard', component: DashboardAdmin, canActivate: [adminGuard] },
  { path: 'admin/applicants', component: ListApplicants, canActivate: [adminGuard] },
  { path: 'admin/companies', component: ListCompanies, canActivate: [adminGuard] },
  { path: 'admin/banks', component: ListBanksAdmin, canActivate: [adminGuard] },
  { path: 'admin/banks/:id', component: DetailBankAdmin, canActivate: [adminGuard] },
  { path: 'admin/careers', component: ListCareers, canActivate: [adminGuard] },

  { path: '**', redirectTo: 'login' },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
