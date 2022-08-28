import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { DashboardService } from "../../dashboard.service";
import swal from 'sweetalert2';
import { ConsoleLogger } from "@angular/compiler-cli/private/localize";


@Component({
  selector: 'app-service-patients',
  templateUrl: './service-patients.component.html',
  styleUrls: ['./service-patients.component.scss']
})
export class ServicePatientsComponent implements OnInit {

  @Input() editData;
  @Input() currentSessionId;
  @Input() currentSessionDate;
  @Input() allPatientsData;
  @Input() allDoctorsData;
  
  public DoctorDetailsForm: FormGroup;
  public DoctorFormSubmitted = false;
  @Output() refreshPatTbl: EventEmitter<any> = new EventEmitter();

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
  selectedDoctor:any;
  tempDocData: any = [];
  patientTreatedByDoctor: any;
  serviceEnd: boolean = false;
  serviceStart: boolean = true;
  serviceComplete: boolean = false;
  serviceStartTime: any;
  serviceEndTime: any;
  allPatientInQueue: any =  [];
  realTimeService: boolean = false;
  toggleProperty:boolean = true;
  toggleView1: boolean = true;
  toggleView2: boolean = false;
  patientServiceTime: any;

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    public modal: NgbModal,
    private _dashboardService: DashboardService
  ) {}

  ngOnInit(): void {

    Promise.all([
      this.getDocNameAndId()
      
    ]).then((values) => {});
    
    this.allPatientInQueue = this.allPatientsData.filter(element => element.isServiced  == 0);

    // Reactive form initialization
    // this.DoctorDetailsForm = this.formBuilder.group({
    //   name: ["", Validators.required],
    //   lastName: ["", Validators.required],
    //   gender: ["", [Validators.required]],
    //   qualification: ["", [Validators.required]],
    //   experience: ["", [Validators.required]],
    // });

    // console.log(this.editData)
    // if(this.editData != null){

    //   this.editStatus = true;

    //   this.DoctorDetailsForm.patchValue({
    //     name: this.editData.name,
    //     lastName: this.editData.lastName,
    //     gender: this.editData.gender,
    //     qualification: this.editData.qualification,
    //     experience: this.editData.experience,
    //   });
    // }

  }

  // getter for easy access to form fields
  // get DoctorForm() {
  //   return this.DoctorDetailsForm.controls;
  // }

  // addDoctor(data) {
  //   return new Promise((resolve, reject) => {
  //     this._dashboardService.AddDoctor(data).subscribe((res) => {
  //       this._dashboardService.swalAddSuccess();
  //       console.log('data added')
  //       this.refreshDoctorTbl();
  //       this.closeModal();
  //     });
  //   });
  // }

  // updateDoctor(data,id){
  //   return new Promise((resolve, reject) => {
  //     this._dashboardService.UpdateDoctor(data,id).subscribe((res) => {
  //       this._dashboardService.swalUpdateSuccess();
  //       console.log('data updated')
  //       this.refreshDoctorTbl();
  //       this.closeModal();
  //     });
  //   });
  // }

  // updatePatient(data,id){
  //   return new Promise((resolve, reject) => {
  //     this._dashboardService.UpdatePatient(data,id).subscribe((res) => {
  //       this._dashboardService.swalUpdateSuccess();
  //       console.log('data updated')
  //       this.refreshDoctorTbl();
  //       this.closeModal();
  //     });
  //   });
  // }


  getDocNameAndId(){
    console.log(this.allDoctorsData)
    this.allDoctorsData.forEach(element => {
      let data = {
        id: element.id,
        name: element.name + " " + element.lastName
      }
      this.tempDocData.push(data)
    });
    console.log(this.tempDocData)
  }

  // DoctorFormOnSubmit() {
  //   this.DoctorFormSubmitted = true;

  //   // stop here if form is invalid
  //   if (this.DoctorDetailsForm.invalid) {
  //     return;
  //   }
    
  //     let formData = this.DoctorDetailsForm.value;
  //     if(this.editStatus){
  //       let data = {
  //         doctorId: this.editData.id,
  //         name: formData.name,
  //         lastName: formData.lastName,
  //         gender: formData.gender,
  //         qualification: formData.qualification,
  //         experience: formData.experience,
  //         isActive: 1,
  //         designationId: 0,
  //         designation: "string",
  //         sessionId: this.editData.sessionId,
  //         sessionDate: this.editData.sessionDate
  //       };
  //       console.log(data);
  //       this.updateDoctor(data, this.editData.doctorId);
        
  //     }
  //     else{
  //       let data = {
  //         doctorId: 0,
  //         name: formData.name,
  //         lastName: formData.lastName,
  //         gender: formData.gender,
  //         qualification: formData.qualification,
  //         experience: formData.experience,
  //         isActive: 1,
  //         designationId: 0,
  //         designation: "string",
  //         sessionId: this.currentSessionId,
  //         sessionDate: this.currentSessionDate
  //       };
  //       console.log(data);
  //       this.addDoctor(data);
  //     }
  // }

  // refreshDoctorTbl() {
  //   this.refreshTbl = true;
  //   this.refreshDocTbl.emit(this.refreshTbl);
  //   }

    closeModal(){
      this.activeModal.dismiss('Cross click')
    }

    setPatientServiceStartTime(patId){
      console.log(patId)

      var d = new Date();
      this.serviceStartTime = new Date();
      let tempStartTime = d.toLocaleTimeString();
      console.log(this.serviceStartTime);
      let selectedDocId = parseInt(this.selectedDoctor)
      console.log(selectedDocId)
      let updatePatient = this.allPatientInQueue.find(p => p.id === patId);
      console.log(updatePatient)
      let data = {
        id: updatePatient.id,
        name: updatePatient.name,
        lastName: updatePatient.lastName,
        gender: updatePatient.gender,
        diagnosis: updatePatient.diagnosis,
        treatedByDoctor: updatePatient.treatedByDoctor,
        treatment: updatePatient.treatment,
        isActive: updatePatient.isActive,
        patientServiceStartTime: tempStartTime,
        patientServiceEndTime: tempStartTime,
        sessionId: updatePatient.sessionId,
        sessionDate: updatePatient.sessionDate,
        totalServiceTime: updatePatient.totalServiceTime,
        isServiced: 0
      };
      return new Promise((resolve, reject) => {
        this._dashboardService.UpdatePatient(data, patId).subscribe((res) => {
          // this._dashboardService.swalUpdateSuccess();
          console.log('service start time added')
          this.serviceStart = false;
          this.serviceEnd = true;
          // this.refreshDoctorTbl();
          // this.closeModal();
        });
      });

      
      
    }

    setPatientServiceEndTime(patId){
      console.log(patId)

      var d = new Date();
      this.serviceEndTime =  new Date();
      let tempEndTime = d.toLocaleTimeString();
      console.log(this.serviceStartTime);
      console.log(this.serviceEndTime);
      let totalServiceTime = ((this.serviceEndTime - this.serviceStartTime)/1000)/60 
      console.log(totalServiceTime)
      let selectedDocId = parseInt(this.selectedDoctor)
      let updatePatient = this.allPatientInQueue.find(p => p.id === patId);
      console.log(updatePatient)
      this.updateDoctorDdl(selectedDocId)
      this.updatePatientDdl(updatePatient.id)
      let data = {
        id: updatePatient.id,
        name: updatePatient.name,
        lastName: updatePatient.lastName,
        gender: updatePatient.gender,
        diagnosis: updatePatient.diagnosis,
        treatedByDoctor: updatePatient.treatedByDoctor,
        treatment: updatePatient.treatment,
        isActive: updatePatient.isActive,
        patientServiceStartTime: updatePatient.patientServiceStartTime,
        patientServiceEndTime: tempEndTime,
        sessionId: updatePatient.sessionId,
        sessionDate: updatePatient.sessionDate,
        totalServiceTime: Math.round(totalServiceTime),
        isServiced: 1
      };
      return new Promise((resolve, reject) => {
        this._dashboardService.UpdatePatient(data, patId).subscribe((res) => {
          // this._dashboardService.swalUpdateSuccess();
          console.log('service end time added')
          this.serviceStart = true;
          this.serviceEnd = false;
          // this.serviceComplete = true;
          // this.refreshDoctorTbl();
          // this.closeModal();
        });
      });
    }


    updateDoctorDdl(index){
      console.log(index)
      // this.tempDocData.splice(index, 1)
      const result = this.tempDocData.filter(element => element.id  != index);
      console.log(result)
      this.tempDocData = []
      this.tempDocData = result
      // this.patientTreatedByDoctor = index;

      const remPatients = this.allPatientInQueue.filter(element => element.id  != index);
      console.log(remPatients)
      this.allPatientInQueue = []
      this.allPatientInQueue = remPatients
    }


    updatePatientDdl(index){
      console.log(index)

      const remPatients = this.allPatientInQueue.filter(element => element.id  != index);
      console.log(remPatients)
      this.allPatientInQueue = []
      this.allPatientInQueue = remPatients
    }

    toggleServiceMethod(){
      this.realTimeService = !this.realTimeService;
    }

    handleViewToggle(value){
      if(value){
        this.toggleView1 = !this.toggleView1
        this.toggleView2 = !this.toggleView2
      }
      else{
        this.toggleView1 = !this.toggleView1
        this.toggleView2 = !this.toggleView2
      }
    }

    updatePatientService(patId){
      let updatePatient = this.allPatientInQueue.find(p => p.id === patId);
      console.log(updatePatient)

      // var d = new Date();
      // let tempEndTime = d.toLocaleTimeString();
      let selectedDocId = parseInt(this.selectedDoctor) 
      let data = {
        id: updatePatient.id,
        name: updatePatient.name,
        lastName: updatePatient.lastName,
        gender: updatePatient.gender,
        diagnosis: updatePatient.diagnosis,
        treatedByDoctor: updatePatient.treatedByDoctor,
        treatment: updatePatient.treatment,
        isActive: updatePatient.isActive,
        patientServiceStartTime: updatePatient.patientServiceStartTime,
        patientServiceEndTime: updatePatient.patientServiceStartTime,
        sessionId: updatePatient.sessionId,
        sessionDate: updatePatient.sessionDate,
        totalServiceTime: this.patientServiceTime,
        isServiced: 1
      };
      return new Promise((resolve, reject) => {
        this._dashboardService.UpdatePatient(data, patId).subscribe((res) => {
          // this._dashboardService.swalUpdateSuccess();
          console.log('total service time added')
          this.updatePatientDdl(updatePatient.id)
          this.updateDoctorDdl(selectedDocId)
          this.refreshTbl = true;
          this.refreshPatTbl.emit(this.refreshTbl);
          // this.serviceComplete = true;
          // this.refreshDoctorTbl();
          // this.closeModal();
        });
      });
    }

}
