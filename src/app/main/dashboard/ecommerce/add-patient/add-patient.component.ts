import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { DashboardService } from "../../dashboard.service";
import swal from 'sweetalert2';

@Component({
  selector: 'app-add-patient',
  templateUrl: './add-patient.component.html',
  styleUrls: ['./add-patient.component.scss']
})
export class AddPatientComponent implements OnInit {
  @Input() editData;
  @Input() currentSessionId;
  @Input() currentSessionDate;
  public PatientDetailsForm: FormGroup;
  public PatientFormSubmitted = false;
  @Output() refreshPatTbl: EventEmitter<any> = new EventEmitter();

  // Reactive User Details form data
  public UDForm = {
    name: "",
    lastName: "",
    gender: "",
    diagnosis: "",
    treatedByDoctor: "",
  };
  editStatus: boolean = false;
  refreshTbl: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    public modal: NgbModal,
    private _dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    // Reactive form initialization
    this.PatientDetailsForm = this.formBuilder.group({
      name: ["", Validators.required],
      lastName: ["", Validators.required],
      gender: ["", [Validators.required]],
      diagnosis: ["", [Validators.required]],
      treatedByDoctor: [""],
      treatment: [""],
    });

    console.log(this.editData)
    if(this.editData != null){

      this.editStatus = true;

      this.PatientDetailsForm.patchValue({
        name: this.editData.name,
        lastName: this.editData.lastName,
        gender: this.editData.gender,
        diagnosis: this.editData.diagnosis,
        treatedByDoctor: this.editData.treatedByDoctor,
        treatment: this.editData.treatment
      });
    }

  }

  // getter for easy access to form fields
  get PatientForm() {
    return this.PatientDetailsForm.controls;
  }

  addPatient(data) {
    return new Promise((resolve, reject) => {
      this._dashboardService.AddPatient(data).subscribe((res) => {
        this._dashboardService.swalAddSuccess();
        console.log('data added')
        this.refreshPatientTbl();
        this.closeModal();
      });
    });
  }

  updatePatient(data,id){
    return new Promise((resolve, reject) => {
      this._dashboardService.UpdatePatient(data,id).subscribe((res) => {
        this._dashboardService.swalUpdateSuccess();
        console.log('data updated')
        this.refreshPatientTbl();
        this.closeModal();
      });
    });
  }

  PatientFormOnSubmit() {
    this.PatientFormSubmitted = true;

    // stop here if form is invalid
    if (this.PatientDetailsForm.invalid) {
      return;
    }
    
      let formData = this.PatientDetailsForm.value;
      if(this.editStatus){
        let data = {
          id: this.editData.id,
          name: formData.name,
          lastName: formData.lastName,
          gender: formData.gender,
          diagnosis: formData.diagnosis,
          treatedByDoctor: formData.treatedByDoctor,
          treatment: formData.treatment,
          isActive: 1,
          patientServiceStartTime: this.editData.patientServiceStartTime,
          patientServiceEndTime: this.editData.patientServiceEndTime,
          sessionId: this.editData.sessionId,
          sessionDate: this.editData.sessionDate,
          totalServiceTime: this.editData.totalServiceTime,
          isServiced: this.editData.isServiced
        };
        console.log(data);
        this.updatePatient(data, this.editData.id);
        
      }
      else{
        let data = {
          id: 0,
          name: formData.name,
          lastName: formData.lastName,
          gender: formData.gender,
          diagnosis: formData.diagnosis,
          treatedByDoctor: formData.treatedByDoctor,
          treatment: formData.treatment,
          isActive: 1,
          patientServiceStartTime: this.currentSessionDate,
          patientServiceEndTime: this.currentSessionDate,
          sessionId: this.currentSessionId,
          sessionDate: this.currentSessionDate,
          totalServiceTime: 0,
          isServiced: 0
        };
        console.log(data);
        this.addPatient(data);
      }
  }

  refreshPatientTbl() {
    this.refreshTbl = true;
    this.refreshPatTbl.emit(this.refreshTbl);
    }

    closeModal(){
      this.activeModal.dismiss('Cross click')
    }
}
