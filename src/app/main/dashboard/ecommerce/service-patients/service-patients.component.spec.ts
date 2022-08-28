import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicePatientsComponent } from './service-patients.component';

describe('ServicePatientsComponent', () => {
  let component: ServicePatientsComponent;
  let fixture: ComponentFixture<ServicePatientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServicePatientsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServicePatientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
