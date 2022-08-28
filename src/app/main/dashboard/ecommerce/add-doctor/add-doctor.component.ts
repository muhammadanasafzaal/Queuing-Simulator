import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { DashboardService } from "../../dashboard.service";
import swal from 'sweetalert2';

@Component({
  selector: "app-add-doctor",
  templateUrl: "./add-doctor.component.html",
  styleUrls: ["./add-doctor.component.scss"],
})
export class AddDoctorComponent implements OnInit {
  @Input() editData;
  @Input() currentSessionId;
  @Input() currentSessionDate;
  
  public DoctorDetailsForm: FormGroup;
  public DoctorFormSubmitted = false;
  @Output() refreshDocTbl: EventEmitter<any> = new EventEmitter();
  

  // Reactive User Details form data
  public UDForm = {
    name: "",
    lastName: "",
    gender: "",
    qualification: "",
    experience: "",
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
    this.DoctorDetailsForm = this.formBuilder.group({
      name: ["", Validators.required],
      lastName: ["", Validators.required],
      gender: ["", [Validators.required]],
      qualification: ["", [Validators.required]],
      experience: ["", [Validators.required]],
    });

    console.log(this.editData)
    if(this.editData != null){

      this.editStatus = true;

      this.DoctorDetailsForm.patchValue({
        name: this.editData.name,
        lastName: this.editData.lastName,
        gender: this.editData.gender,
        qualification: this.editData.qualification,
        experience: this.editData.experience,
      });
    }

  }

  // getter for easy access to form fields
  get DoctorForm() {
    return this.DoctorDetailsForm.controls;
  }

  addDoctor(data) {
    return new Promise((resolve, reject) => {
      this._dashboardService.AddDoctor(data).subscribe((res) => {
        this._dashboardService.swalAddSuccess();
        console.log('data added')
        this.refreshDoctorTbl();
        this.closeModal();
      });
    });
  }

  updateDoctor(data,id){
    return new Promise((resolve, reject) => {
      this._dashboardService.UpdateDoctor(data,id).subscribe((res) => {
        this._dashboardService.swalUpdateSuccess();
        console.log('data updated')
        this.refreshDoctorTbl();
        this.closeModal();
      });
    });
  }

  DoctorFormOnSubmit() {
    this.DoctorFormSubmitted = true;

    // stop here if form is invalid
    if (this.DoctorDetailsForm.invalid) {
      return;
    }
    
      let formData = this.DoctorDetailsForm.value;
      if(this.editStatus){
        let data = {
          id: this.editData.id,
          name: formData.name,
          lastName: formData.lastName,
          gender: formData.gender,
          qualification: formData.qualification,
          experience: formData.experience,
          isActive: 1,
          designationId: 0,
          designation: "string",
          sessionId: this.editData.sessionId,
          sessionDate: this.editData.sessionDate
        };
        console.log(data);
        this.updateDoctor(data, this.editData.id);
        
      }
      else{
        let data = {
          id: 0,
          name: formData.name,
          lastName: formData.lastName,
          gender: formData.gender,
          qualification: formData.qualification,
          experience: formData.experience,
          isActive: 1,
          designationId: 0,
          designation: "string",
          sessionId: this.currentSessionId,
          sessionDate: this.currentSessionDate
        };
        console.log(data);
        this.addDoctor(data);
      }
  }

  refreshDoctorTbl() {
    this.refreshTbl = true;
    this.refreshDocTbl.emit(this.refreshTbl);
    }

    closeModal(){
      this.activeModal.dismiss('Cross click')
    }
}
