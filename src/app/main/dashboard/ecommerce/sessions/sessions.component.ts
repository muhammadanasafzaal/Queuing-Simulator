import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { DashboardService } from "../../dashboard.service";
import swal from 'sweetalert2';

@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.scss']
})
export class SessionsComponent implements OnInit {
  @Input() editData;
  public SessionDetailsForm: FormGroup;
  public SessionFormSubmitted = false;
  @Output() refreshSesTbl: EventEmitter<any> = new EventEmitter();
  @Output() sessionTimeout: EventEmitter<any> = new EventEmitter();

  // Reactive User Details form data
  public UDForm = {
    date: "",
    totalDoctorOnService: "",
    totalPatientsArrived: "",
    totalTimeOfEachSession: "",
    averagePatientServiceTime: "",
  };
  editStatus: boolean = false;
  refreshTbl: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    public modal: NgbModal,
    private _dashboardService: DashboardService
  ) {

  }

  ngOnInit(): void {
    // Reactive form initialization

    
    this.SessionDetailsForm = this.formBuilder.group({
      date: [(new Date()).toISOString().substring(0,10), Validators.required],
      totalDoctorOnService: [0],
      totalPatientsArrived: [0],
      totalTimeOfEachSession: ["", [Validators.required]],
      averagePatientServiceTime: [0],
    });

    console.log(this.editData)
    if(this.editData != null){

      this.editStatus = true;

      this.SessionDetailsForm.patchValue({
        date: this.editData.sessionDate,
        totalDoctorOnService: this.editData.totalDoctorOnService,
        totalPatientsArrived: this.editData.totalPatientsArrived,
        totalTimeOfEachSession: this.editData.totalTimeOfEachSession,
        averagePatientServiceTime: this.editData.averagePatientServiceTime
      });
    }
    else{
      this.editStatus = false;
    }

  }

  // getter for easy access to form fields
  get SessionForm() {
    return this.SessionDetailsForm.controls;
  }

  addSession(data) {
    return new Promise((resolve, reject) => {
      this._dashboardService.AddSession(data).subscribe((res) => {
        this._dashboardService.swalAddSuccess();
        console.log('data added')
        this.refreshSessionTbl();
        this.closeModal();
      });
    });
  }

  updateSession(data,id){
    return new Promise((resolve, reject) => {
      this._dashboardService.UpdateSession(data,id).subscribe((res) => {
        this._dashboardService.swalUpdateSuccess();
        console.log('data updated')
        this.refreshSessionTbl();
        this.closeModal();
      });
    });
  }

  SessionFormOnSubmit() {
    this.SessionFormSubmitted = true;

    // stop here if form is invalid
    if (this.SessionDetailsForm.invalid) {
      return;
    }
    
      // var today = new Date();
      // var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
      // var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      // var dateTime = date+' '+time;
      // console.log(dateTime)
      let formData = this.SessionDetailsForm.value;
      // this.sessionTimeout = formData.totalTimeOfEachSession

      if(this.editStatus){
        let data = {
          id: this.editData.id,
          sessionDate: this.editData.sessionDate,
          totalDoctorsOnService: formData.totalDoctorOnService,
          totalPatientsArrived: formData.totalPatientsArrived,
          totalTimeOfEachSession: formData.totalTimeOfEachSession,
          averagePatientServiceTime: formData.averagePatientServiceTime,
          isActive: this.editData.isActive
        };
        console.log(data);
        this.updateSession(data, this.editData.id);
        
      }
      else{
        let currentSessionDate = this.calcLocalTime('+5')
        console.log(currentSessionDate)
        
        console.log(formData.date)
        let data = {
          id: 0,
          sessionDate: '2022-08-17',
          totalDoctorsOnService: formData.totalDoctorOnService,
          totalPatientsArrived: formData.totalPatientsArrived,
          totalTimeOfEachSession: formData.totalTimeOfEachSession,
          averagePatientServiceTime: formData.averagePatientServiceTime,
          isActive: 1
        };
        console.log(data);
        this.addSession(data);
      }
  }

  refreshSessionTbl() {
    this.refreshTbl = true;
    this.refreshSesTbl.emit(this.refreshTbl);
    }

    closeModal(){
      this.activeModal.dismiss('Cross click')
    }

    checkValidDate(checkValidDate){
      var todayDate = new Date().toISOString().slice(0, 10);
      console.log(todayDate);
      if(checkValidDate < todayDate){
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Please select a valid date'
        })
        this.SessionDetailsForm.patchValue({
          date: todayDate,
        });
      }
    }

    calcLocalTime(offset) {
      // create Date object for current location
      var d = new Date();
  
      // convert to msec
      // subtract local time zone offset
      // get UTC time in msec
      var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  
      // create new Date object for different city
      // using supplied offset
      var nd = new Date(utc + (3600000*offset));
     
      // return time as a string
      let dateWithTime = nd.toLocaleString();
      let dateOnly = dateWithTime.split(' ')[0];
      let finalDate = dateOnly.slice(0, -1);
      return finalDate.split("/").reverse().join("-");
      // return nd.toISOString()
  }

}
