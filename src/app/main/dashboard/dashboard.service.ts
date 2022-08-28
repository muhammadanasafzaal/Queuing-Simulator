import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Doctor, Patient, Session } from "./ecommerce/shared/hospital-data.model";
import { BehaviorSubject, Observable } from "rxjs";
import swal from "sweetalert2";


@Injectable()
export class DashboardService {
  // Public
  public apiData: any;
  public onApiDataChanged: BehaviorSubject<any>;
  patientUrl: string = "https://localhost:44323/api/Patient";
  doctorUrl: string = "https://localhost:44323/api/Doctor";
  sessionUrl: string = "https://localhost:44323/api/Session";
  public sessionData:any;
  /**
   * Constructor
   *
   * @param {HttpClient} _httpClient
   */
  constructor(private _httpClient: HttpClient) {
    // Set the defaults
    this.onApiDataChanged = new BehaviorSubject({});
  }

  /**
   * Resolver
   *
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   * @returns {Observable<any> | Promise<any> | any}
   */
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getApiData()]).then(() => {
        resolve();
      }, reject);
    });
  }

  /**
   * Get Api Data
   */
  getApiData(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this._httpClient.get("api/dashboard-data").subscribe((response: any) => {
        this.apiData = response;
        this.onApiDataChanged.next(this.apiData);
        resolve(this.apiData);
      }, reject);
    });
  }

  //sweet alert success dialog
  swalAddSuccess() {
    swal.fire("Success!", "Data added successfully", "success");
  }
  swalUpdateSuccess() {
    swal.fire("Success!", "Data updated successfully", "success");
  }

  //sweet alert error dialog
  swalError() {
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Something went wrong!'
    })
  }

  //get doctors
  GetAllDoctors(): Observable<Doctor[]> {
    return this._httpClient.get<Doctor[]>(this.doctorUrl);
  }

  //add doctor
  AddDoctor(data) {
    return this._httpClient.post(this.doctorUrl, data);
  }

  //update doctor
  UpdateDoctor(data, id) {
    console.log(data, "data");
    console.log(id, "id");
    return this._httpClient.put(`${this.doctorUrl}/${id}`, data);
  }

  //delete doctor
  DeleteDoctor(id: number) {
    return this._httpClient.delete(`${this.doctorUrl}/${id}`);
  }



  //get patients
  GetAllPatients(): Observable<Patient[]> {
    return this._httpClient.get<Patient[]>(this.patientUrl);
  }

  //add patient
  AddPatient(data) {
    return this._httpClient.post(this.patientUrl, data);
  }

  //update patient
  UpdatePatient(data, id) {
    console.log(data, "data");
    console.log(id, "id");
    return this._httpClient.put(`${this.patientUrl}/${id}`, data);
  }

  //delete patient
  DeletePatient(id: number) {
    return this._httpClient.delete(`${this.patientUrl}/${id}`);
  }



  //get sessions
  GetAllSessions(): Observable<Session[]> {
    return this._httpClient.get<Session[]>(this.sessionUrl);
  }

  //add session
  AddSession(data) {
    return this._httpClient.post(this.sessionUrl, data);
  }

  //update session
  UpdateSession(data, id) {
    console.log(data, "data");
    console.log(id, "id");
    return this._httpClient.put(`${this.sessionUrl}/${id}`, data);
  }

  //delete session
  DeleteSession(id: number) {
    return this._httpClient.delete(`${this.sessionUrl}/${id}`);
  }


  // getSessionUpdate() {
  //   const sessionObservable = new Observable((observer) => {
  //     observer.next(this.sessionData);
  //   });
  //   return sessionObservable;
  // }

}
