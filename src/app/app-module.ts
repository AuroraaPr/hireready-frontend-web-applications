import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Sidebar } from './components/shared/sidebar/sidebar';
import { Topbar } from './components/shared/topbar/topbar';
import { EmptyState } from './components/shared/empty-state/empty-state';
import { ScorePill } from './components/shared/score-pill/score-pill';
import { AudioPlayer } from './components/shared/audio-player/audio-player';
import { ConfirmarAccion } from './components/shared/confirmar-accion/confirmar-accion';
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
import { ListCareers } from './components/admin/list-careers/list-careers';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './modules/material/material-module';
import { HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { autorizacionInterceptor } from './interceptors/autorizacion-interceptor';
import { DetailBank } from './components/shared/detail-bank/detail-bank';

@NgModule({
  declarations: [
    App,
    Sidebar,
    Topbar,
    EmptyState,
    ScorePill,
    AudioPlayer,
    ConfirmarAccion,
    Login,
    RegisterApplicant,
    RegisterCompany,
    DashboardApplicant,
    ListSimulations,
    RunSimulation,
    ReportSimulation,
    ListHistory,
    SaveProfileApplicant,
    DashboardCompany,
    ListBanksCompany,
    SaveBankCompany,
    SaveProfileCompany,
    DashboardAdmin,
    ListApplicants,
    ListCompanies,
    ListBanksAdmin,
    ListCareers,
    DetailBank,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([autorizacionInterceptor])),
  ],
  bootstrap: [App],
})
export class AppModule {}
