import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgApexchartsModule } from 'ng-apexcharts';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

import { AuthGuard } from 'app/auth/helpers';
import { Role } from 'app/auth/models';

import { CoreCommonModule } from '@core/common.module';

import { InvoiceModule } from 'app/main/apps/invoice/invoice.module';
import { InvoiceListService } from 'app/main/apps/invoice/invoice-list/invoice-list.service';

import { DashboardService } from 'app/main/dashboard/dashboard.service';

import { AnalyticsComponent } from 'app/main/dashboard/analytics/analytics.component';
import { EcommerceComponent } from 'app/main/dashboard/ecommerce/ecommerce.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { AddDoctorComponent } from './ecommerce/add-doctor/add-doctor.component';
import { AddPatientComponent } from './ecommerce/add-patient/add-patient.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { SessionsComponent } from './ecommerce/sessions/sessions.component';
import { ServicePatientsComponent } from './ecommerce/service-patients/service-patients.component';
import { SimulationFormComponent } from './ecommerce/simulation-form/simulation-form.component';

const routes = [
  {
    path: 'analytics',
    component: AnalyticsComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.Admin], animation: 'danalytics' },
    resolve: {
      css: DashboardService,
      inv: InvoiceListService
    }
  },
  {
    path: 'person-list',
    component: EcommerceComponent,
    canActivate: [AuthGuard],
    resolve: {
      css: DashboardService
    },
    data: { animation: 'decommerce' }
  },

];

@NgModule({
  declarations: [AnalyticsComponent, EcommerceComponent, AddDoctorComponent, AddPatientComponent, SessionsComponent, ServicePatientsComponent, SimulationFormComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TranslateModule,
    NgbModule,
    PerfectScrollbarModule,
    CoreCommonModule,
    NgApexchartsModule,
    InvoiceModule,
    NgxDatatableModule,
    ReactiveFormsModule,
    FormsModule,
    SweetAlert2Module
  ],
  providers: [DashboardService, InvoiceListService],
  exports: [EcommerceComponent]
})
export class DashboardModule {}
