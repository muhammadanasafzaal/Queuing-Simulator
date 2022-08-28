import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { DashboardService } from "../../dashboard.service";
import swal from "sweetalert2";
import { Console } from "console";

@Component({
  selector: "app-simulation-form",
  templateUrl: "./simulation-form.component.html",
  styleUrls: ["./simulation-form.component.scss"],
})
export class SimulationFormComponent implements OnInit {
  @Input() editData;
  @Input() currentSessionId;
  @Input() currentSessionDate;

  public SimulationDataForm: FormGroup;
  public SimulationDataFormSubmitted = false;
  @Output() refreshDocTbl: EventEmitter<any> = new EventEmitter();
  @Output() simData: EventEmitter<any> = new EventEmitter();
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
  totalSumOfArrivalTime: number = 0;
  totalSumOfInterArrivalTime: number = 0;
  custArrvData: any[] = [];
  distServTimeData: any[] = [];
  totalServiceTime: number = 0;

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    public modal: NgbModal,
    private _dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    // Reactive form initialization
    this.SimulationDataForm = this.formBuilder.group({
      arrivalRate: ["", Validators.required],
      serviceRate: ["", Validators.required],
      serverCount: ["", Validators.required],
    });

    // console.log(this.editData)
    // if(this.editData != null){

    //   this.editStatus = true;

    //   this.SimulationDataForm.patchValue({
    //     name: this.editData.name,
    //     lastName: this.editData.lastName,
    //     gender: this.editData.gender,
    //     qualification: this.editData.qualification,
    //     experience: this.editData.experience,
    //   });
    // }
  }

  // getter for easy access to form fields
  get SimulationForm() {
    return this.SimulationDataForm.controls;
  }

  addSimulationData(data) {
    return new Promise((resolve, reject) => {
      this._dashboardService.AddDoctor(data).subscribe((res) => {
        this._dashboardService.swalAddSuccess();
        console.log("data added");
        this.refreshDoctorTbl();
        this.closeModal();
      });
    });
  }

  // updateSimulationData(data,id){
  //   return new Promise((resolve, reject) => {
  //     this._dashboardService.UpdateDoctor(data,id).subscribe((res) => {
  //       this._dashboardService.swalUpdateSuccess();
  //       console.log('data updated')
  //       this.refreshDoctorTbl();
  //       this.closeModal();
  //     });
  //   });
  // }

  getfactorial(n) {
    if (n < 0) return;
    if (n < 2) return 1;
    return n * this.getfactorial(n - 1);
  }

  getRandomNumber() {
    let randNumForArrv = parseFloat(Math.random().toFixed(4));
    return randNumForArrv;
  }

  SimulationDataFormOnSubmit() {
    this.SimulationDataFormSubmitted = true;

    // stop here if form is invalid
    if (this.SimulationDataForm.invalid) {
      return;
    }

    let formData = this.SimulationDataForm.value;

    //STEP 1: calculate all cummulative probability
    let arrRate = formData.arrivalRate;
    let serRate = formData.serviceRate;
    //euler constant
    let e = Math.E;
    let cmProb = 0;
    let x = 0;
    let interArrTime = 0;
    let i = 0;

    let arrivalTime = 0;
    let arrData = [];
    let prevVal = 0;
    let tmpStr = 0;
    let tmpCmPbLookUp;
    let tmpCmProb = 0;
    let tmpCmProbToFour = 0;
    let tmpIntArrv = 0;

    while (tmpCmProb < 1) {
      // console.log(i)
      prevVal = cmProb;
      cmProb += (e ** -arrRate * arrRate ** i) / this.getfactorial(i);
      tmpCmProb = parseFloat(cmProb.toFixed(9));
      tmpCmProbToFour = parseFloat(cmProb.toFixed(9));
      // interArrTime = parseFloat((x - tmpCmProbToFour).toFixed(9))
      console.log(tmpCmProb, "cummulative prob");
      console.log(x, "cummulative prob lookup");
      console.log(i, "no of minutes bw arrival");
      // console.log(interArrTime, 'inter arrival time')
      let data = {
        cmProb: tmpCmProb,
        cmProbLookup: x,
        minBwArr: i,
        arrvTime: null,
        //interArrTime: interArrTime
      };
      arrData.push(data);
      x = parseFloat(tmpCmProb.toFixed(9));
      i++;
    }
    console.log(arrData, "before rand num assign");

    let dataWithIntArrv;

    for (let i = 0; i < arrData.length; i++) {
      let tmpRandNum = this.getRandomNumber();
      console.log(tmpRandNum, "rand num");
      for (let j = 0; j < arrData.length; j++) {
        if (
          tmpRandNum >= arrData[j].cmProbLookup &&
          tmpRandNum <= arrData[j].cmProb
        ) {
          //data obj having rand num in its inter arrv range
          dataWithIntArrv = arrData[j];
          console.log(dataWithIntArrv, "rand num in inter arrv range");
        }
      }
      if (i == 0) {
        arrData[i].arrvTime = 0;
      } else {
        arrData[i].arrvTime = dataWithIntArrv.minBwArr;
      }
    }

    let tmpCustArrvData = [];
    tmpCustArrvData = arrData;
    console.log(
      tmpCustArrvData,
      "arrival of each customer data after rand num assign"
    );

    let tmpArrvTimeTotal = 0;
    tmpCustArrvData.forEach((element) => {
      tmpArrvTimeTotal += element.arrvTime;
      let data = {
        cmProb: element.cmProb,
        cmProbLookup: element.cmProbLookup,
        minBwArr: element.minBwArr,
        interArrvTime: element.arrvTime,
        arrvTimeSum: tmpArrvTimeTotal,
      };
      this.custArrvData.push(data);
    });

    console.log(this.custArrvData, "final data after summing arrv times");

    //total sum of arrival time
    this.custArrvData.forEach((element) => {
      this.totalSumOfInterArrivalTime += element.interArrvTime;
      this.totalSumOfArrivalTime += element.arrvTimeSum;
    });
    console.log(
      this.totalSumOfInterArrivalTime,
      "total sum of inter arrival time"
    );
    console.log(this.totalSumOfArrivalTime, "total sum of arrival time");

    //STEP 2: calculate distribution of service time
    let tmpDistServTimeData = [];
    let servTime = 0;
    let rand;

    for (let i = 0; i < this.custArrvData.length; i++) {
      rand = this.getRandomNumber();
      servTime = Math.round(Math.abs(serRate * Math.log(rand)));
      let data = {
        serialNo: i + 1,
        serviceTime: servTime,
      };
      tmpDistServTimeData.push(data);
    }
    this.distServTimeData = tmpDistServTimeData;
    console.log(this.distServTimeData, "dist service time data");

    //total sum of service time
    this.distServTimeData.forEach((element) => {
      this.totalServiceTime += element.serviceTime;
    });
    console.log(this.totalServiceTime, "total service time");

    //STEP 3: queuing data for simulation
    let serv1 = "free";
    let serv2 = "free";

    let tmpArrServData = [];
    for (let i = 0; i < this.custArrvData.length; i++) {
      let data = {
        arrivalTime: this.custArrvData[i].arrvTimeSum,
        serviceTime: this.distServTimeData[i].serviceTime,
      };
      tmpArrServData.push(data);
    }
    console.log(tmpArrServData, "arr and serv data");

    let s1Timeout;
    let s2Timeout;



    let tmpServData = [];
    let totalServers = formData.serverCount;
    let allServerStatus = []
    for(let i = 0; i<totalServers; i++){
      let data = {
        serverNo: i+1,
        status: 'free'
      }
      allServerStatus.push(data)
    }
    console.log(allServerStatus, 'all server status')

    tmpArrServData = [
      // {arrivalTime: 0, serviceTime: 0},
      // {arrivalTime: 2, serviceTime: 7},
      // {arrivalTime: 7, serviceTime: 0},
      // {arrivalTime: 8, serviceTime: 0},
      // {arrivalTime: 11, serviceTime: 7},
      // {arrivalTime: 15, serviceTime: 15},
      // {arrivalTime: 15, serviceTime: 13},
      // {arrivalTime: 15, serviceTime: 0},
      // {arrivalTime: 15, serviceTime: 0},
      // {arrivalTime: 15, serviceTime: 10},
      // {arrivalTime: 15, serviceTime: 6},
      // {arrivalTime: 17, serviceTime: 7},
      // {arrivalTime: 17, serviceTime: 0},
      // {arrivalTime: 20, serviceTime: 15},


          // {arrivalTime: 0, serviceTime: 1},
          // {arrivalTime: 2, serviceTime: 4},
          // {arrivalTime: 6, serviceTime: 5},
          // {arrivalTime: 12, serviceTime: 2},
          // {arrivalTime: 13, serviceTime: 12},
          // {arrivalTime: 16, serviceTime: 2},
          // {arrivalTime: 18, serviceTime: 11},
          // {arrivalTime: 20, serviceTime: 2},
          // {arrivalTime: 21, serviceTime: 2},
          // {arrivalTime: 22, serviceTime: 2},
          // {arrivalTime: 26, serviceTime: 1},
          // {arrivalTime: 26, serviceTime: 4},
          // {arrivalTime: 30, serviceTime: 3},
          // {arrivalTime: 34, serviceTime: 6},
          // {arrivalTime: 36, serviceTime: 1},
          // {arrivalTime: 41, serviceTime: 1},
          // {arrivalTime: 43, serviceTime: 9},
          // {arrivalTime: 45, serviceTime: 2},
          // {arrivalTime: 47, serviceTime: 1},

      {arrivalTime: 0, serviceTime: 5},
      {arrivalTime: 2, serviceTime: 7},
      {arrivalTime: 7, serviceTime: 12},
      {arrivalTime: 8, serviceTime: 8},
      {arrivalTime: 11, serviceTime: 7},
      {arrivalTime: 12, serviceTime: 7},
      {arrivalTime: 14, serviceTime: 6},
      {arrivalTime: 15, serviceTime: 15},
      {arrivalTime: 15, serviceTime: 13},
      {arrivalTime: 15, serviceTime: 11},
      {arrivalTime: 15, serviceTime: 11},
      {arrivalTime: 15, serviceTime: 10},
      {arrivalTime: 15, serviceTime: 6},
      {arrivalTime: 17, serviceTime: 7},
      {arrivalTime: 17, serviceTime: 8},
      {arrivalTime: 20, serviceTime: 15},
     
  ]

  let temp = []


  for (let i = 0; i < tmpArrServData.length; i++) {
    console.log(i)
    if (i == 0) {
        let data = {
            customer: i+1,
            interArrival: this.custArrvData[i].interArrvTime,
            arrivalTime:tmpArrServData[i].arrivalTime,
            startTime: tmpArrServData[i].arrivalTime,
            endTime: tmpArrServData[i].arrivalTime + tmpArrServData[i].serviceTime,
            servicedBy: 1,
            serverUtilization: tmpArrServData[i].serviceTime,
            turnAround: (tmpArrServData[i].arrivalTime + tmpArrServData[i].serviceTime) - tmpArrServData[i].arrivalTime,
            waitTimeQueue: ((tmpArrServData[i].arrivalTime + tmpArrServData[i].serviceTime) - tmpArrServData[i].arrivalTime) - tmpArrServData[i].serviceTime,
            responseTime: tmpArrServData[i].arrivalTime - tmpArrServData[i].arrivalTime
        };
        tmpServData.push(data);
        console.log(tmpServData);

        let getServer = allServerStatus.find((item) => item.status == "free");
        getServer["status"] = "busy";
    } else {
        // if (tmpServData.length == 1) {
            // console.log(tmpArrServData[i].arrivalTime < tmpServData[i-1].endTime)

            if (tmpArrServData[i].arrivalTime < tmpServData[i-1].endTime) {
                let serverToIgnore;
                let serverFree;
                console.log(i)

                // for (let j = 0; j < tmpServData.length; j++) {
                //     if (tmpArrServData[i].arrivalTime < tmpServData[j].endTime) {
                //         serverToIgnore = tmpServData[j].servicedBy;
                //         // console.log("current arrival rate lie in" + serverToIgnore)

                //         serverFree = allServerStatus.find((item) => item.serverNo != serverToIgnore);
                //     }
                //     else if (tmpArrServData[i].arrivalTime > tmpServData[j].endTime) {
                //       serverToIgnore = tmpServData[j].servicedBy;

                //       serverFree = allServerStatus.find((item) => item.serverNo == serverToIgnore);
                //       console.log(serverFree);
                //   }
                // }
                console.log(i)
                let lastLargestEndTime = tmpServData.reduce((p, c) => p.endTime > c.endTime ? p : c);
                if (tmpArrServData[i].arrivalTime < lastLargestEndTime.endTime) {
                  serverFree = allServerStatus.find((item) => item.serverNo != lastLargestEndTime.servicedBy);
                  console.log(serverFree);
                }
                else if (tmpArrServData[i].arrivalTime > lastLargestEndTime.endTime) {
                  serverFree = allServerStatus.find((item) => item.serverNo == lastLargestEndTime.servicedBy);
                  console.log(serverFree);
                }

                const lastIndexOf = (array, servicedBy) => {
                  for(let x = array.length - 1; x >= 0; x--){
                    if(array[x].servicedBy == servicedBy)
                      return x;
                  }
                  return -1;
                };
                
                // let lastSameServerIndx = lastIndexOf(tmpServData, serverFree.serverNo); 
                // let tmpLastServer = {
                //   server: serverFree.serverNo,
                //   lastSameServer: lastSameServerIndx == -1 ? null : tmpServData[lastSameServerIndx].servicedBy
                // }
                // temp.push(tmpLastServer)
                // console.log('temp', temp)
                for(let c=0; c<tmpServData.length; c++){
                  // if(c==0){
                  //   tmpServData[c].status = "free"
                  // }
                  // if(c!=0){
                  if( tmpArrServData[i].arrivalTime > tmpServData[c].endTime){
                    tmpServData[c].status = "free"
                                    
                    let getServer = allServerStatus.find(item => item.serverNo == tmpServData[c].servicedBy)
                    getServer['status'] = 'free';
                  }
                  else if( tmpArrServData[i].arrivalTime < tmpServData[c].endTime){
                    tmpServData[c].status = "busy"
                    let getServer = allServerStatus.find(item => item.serverNo == tmpServData[c].servicedBy)
                    getServer['status'] = 'busy';
                  }
                  // }
                }
                
                console.log(allServerStatus);
                let lastSameServerIndx;
                let lastSameServerEndTimes = [];
                let nextAvailServer;
                // for(let h=0; h<allServerStatus.length; h++){
                  let freeServer = allServerStatus.find(x => x.status == 'free')
                  if(freeServer != null){
                  
                    let lastSameServerIndx = lastIndexOf(tmpServData, freeServer.serverNo); 
                    if(lastSameServerIndx != -1){
                    let data = {
                          customer: i+1,
                          interArrival: this.custArrvData[i].interArrvTime,
                          arrivalTime:tmpArrServData[i].arrivalTime,
                          startTime: tmpArrServData[i].arrivalTime < tmpServData[lastSameServerIndx].endTime ? tmpServData[lastSameServerIndx].endTime : tmpArrServData[i].arrivalTime,
                          endTime: tmpArrServData[i].arrivalTime < tmpServData[lastSameServerIndx].endTime ? tmpServData[lastSameServerIndx].endTime + tmpArrServData[i].serviceTime : tmpArrServData[i].arrivalTime + tmpArrServData[i].serviceTime,
                          // servicedBy: serverFree.serverNo,
                          servicedBy: freeServer.serverNo,
                          serverUtilization: tmpArrServData[i].serviceTime,
                          turnAround: (tmpArrServData[i].arrivalTime < tmpServData[lastSameServerIndx].endTime ? tmpServData[lastSameServerIndx].endTime + tmpArrServData[i].serviceTime : tmpArrServData[i].arrivalTime + tmpArrServData[i].serviceTime) - tmpArrServData[i].arrivalTime,
                          waitTimeQueue: (((tmpArrServData[i].arrivalTime < tmpServData[lastSameServerIndx].endTime ? tmpServData[lastSameServerIndx].endTime + tmpArrServData[i].serviceTime : tmpArrServData[i].arrivalTime + tmpArrServData[i].serviceTime) - tmpArrServData[i].arrivalTime) - tmpArrServData[i].serviceTime),
                          responseTime: (tmpArrServData[i].arrivalTime < tmpServData[lastSameServerIndx].endTime ? tmpServData[lastSameServerIndx].endTime : tmpArrServData[i].arrivalTime) - tmpArrServData[i].arrivalTime
                      };
                      tmpServData.push(data);
                    }

                    else{
                      let data = {
                        customer: i+1,
                        interArrival: this.custArrvData[i].interArrvTime,
                        arrivalTime:tmpArrServData[i].arrivalTime,
                        startTime: tmpArrServData[i].arrivalTime,
                        endTime: tmpArrServData[i].arrivalTime + tmpArrServData[i].serviceTime,
                         // servicedBy: serverFree.serverNo,
                        servicedBy: freeServer.serverNo,
                        serverUtilization: tmpArrServData[i].serviceTime,
                        turnAround: (tmpArrServData[i].arrivalTime + tmpArrServData[i].serviceTime) - tmpArrServData[i].arrivalTime,
                        waitTimeQueue: (((tmpArrServData[i].arrivalTime + tmpArrServData[i].serviceTime) - tmpArrServData[i].arrivalTime) - tmpArrServData[i].serviceTime),
                        responseTime: tmpArrServData[i].arrivalTime - tmpArrServData[i].arrivalTime
                      }
                      tmpServData.push(data);
                    }
                  }
                  else{
                    for(let p=0; p<allServerStatus.length; p++){
                      lastSameServerIndx = lastIndexOf(tmpServData, allServerStatus[p].serverNo); 
                      let data = {
                        serverNo: tmpServData[lastSameServerIndx].servicedBy,
                        endTime: tmpServData[lastSameServerIndx].endTime
                      }
                      lastSameServerEndTimes.push(data)
                    }
                    nextAvailServer = lastSameServerEndTimes.reduce(function(res, obj) {
                        return (obj.endTime < res.endTime) ? obj : res;
                    });

                    let data = {
                          customer: i+1,
                          interArrival: this.custArrvData[i].interArrvTime,
                          arrivalTime:tmpArrServData[i].arrivalTime,
                          startTime: tmpArrServData[i].arrivalTime < nextAvailServer.endTime ? nextAvailServer.endTime : tmpArrServData[i].arrivalTime,
                          endTime: tmpArrServData[i].arrivalTime < nextAvailServer.endTime ? nextAvailServer.endTime + tmpArrServData[i].serviceTime : tmpArrServData[i].arrivalTime + tmpArrServData[i].serviceTime,
                          // servicedBy: serverFree.serverNo,
                          servicedBy: nextAvailServer.serverNo,
                          serverUtilization: tmpArrServData[i].serviceTime,
                          turnAround: (tmpArrServData[i].arrivalTime < nextAvailServer.endTime ? nextAvailServer.endTime + tmpArrServData[i].serviceTime : tmpArrServData[i].arrivalTime + tmpArrServData[i].serviceTime) - tmpArrServData[i].arrivalTime,
                          waitTimeQueue: ((tmpArrServData[i].arrivalTime < nextAvailServer.endTime ? nextAvailServer.endTime + tmpArrServData[i].serviceTime : tmpArrServData[i].arrivalTime + tmpArrServData[i].serviceTime) - tmpArrServData[i].arrivalTime) - tmpArrServData[i].serviceTime,
                          responseTime: (tmpArrServData[i].arrivalTime < nextAvailServer.endTime ? nextAvailServer.endTime : tmpArrServData[i].arrivalTime) -  tmpArrServData[i].arrivalTime
                      };
                      tmpServData.push(data);
                    }
                    // console.log(tmpServData);
                  
            


            } 
            else if (tmpArrServData[i].arrivalTime > tmpServData[i-1].endTime) {
                let serverToIgnore;
                let serverFree;

                // for (let k = 0; k < tmpServData.length; k++) {
                //     if (tmpArrServData[i].arrivalTime < tmpServData[k].endTime) {
                //         serverToIgnore = tmpServData[k].servicedBy;

                //         serverFree = allServerStatus.find((item) => item.serverNo != serverToIgnore);
                //         console.log(serverFree);
                //     }
                //     else if (tmpArrServData[i].arrivalTime > tmpServData[k].endTime) {
                //       serverToIgnore = tmpServData[k].servicedBy;

                //       serverFree = allServerStatus.find((item) => item.serverNo == serverToIgnore);
                //       console.log(serverFree);
                //   }
                // }
                console.log(i)
                let lastLargestEndTime = tmpServData.reduce((p, c) => p.endTime > c.endTime ? p : c);
                if (tmpArrServData[i].arrivalTime < lastLargestEndTime.endTime) {
                  serverFree = allServerStatus.find((item) => item.serverNo == lastLargestEndTime.servicedBy);
                  console.log(serverFree);
                }
                else if (tmpArrServData[i].arrivalTime > lastLargestEndTime.endTime) {
                  serverFree = allServerStatus.find((item) => item.serverNo == lastLargestEndTime.servicedBy);
                  console.log(serverFree);
                }
                // let selectedServerLastIndex = tmpServData.lastIndexOf(serverFree.serverNo);
                // let selectedServerData = tmpServData[selectedServerLastIndex]
                // if(tmpArrServData[i].arrivalTime < selectedServerData.endTime){
                //   let data = {
                //     startTime: selectedServerData.endTime,
                //     endTime: selectedServerData.endTime + tmpArrServData[i].serviceTime,
                //     servicedBy: serverFree.serverNo,
                //   };
                //   tmpServData.push(data);
                // }
                // else {
                //   let data = {
                //       startTime: tmpArrServData[i].arrivalTime,
                //       endTime: tmpArrServData[i].arrivalTime + tmpArrServData[i].serviceTime,
                //       servicedBy: serverFree.serverNo,
                //   };
                //   tmpServData.push(data);
                // }

                // for(let e=0; e<allServerStatus.length; e++){
                //   if(allServerStatus[i].serverNo == serverFree.serverNo){
                //     let getServer = allServerStatus.find(item => item.serverNo == serverFree.serverNo)
                //     getServer['status'] = 'busy';
                //   }
                 
                //   else{
                //     for(let n = 0; n<tmpServData.length; n++){
                //       if( tmpArrServData[i].arrivalTime > tmpServData[n].endTime){
                //       //   const result = Object.values(tmpServData.reduce((acc, cur) => { 
                //       //     acc[cur.servicedBy] = cur;
                //       //     return acc;
                //       // }, {}))
                      
                //       // console.log('Result:', result)

                //         let getServer = allServerStatus.find(item => item.serverNo == serverFree.serverNo)
                //         getServer['status'] = 'busy';
                //       }
                //     }
                //   }
                // }
                const lastIndexOf = (array, servicedBy) => {
                  for(let y = array.length - 1; y >= 0; y--){
                    if(array[y].servicedBy == servicedBy)
                      return y;
                  }
                  return -1;
                };
                
                // let tmpLastServer = {
                //   server: serverFree.serverNo,
                //   lastSameServer: lastSameServerIndx == -1 ? null : tmpServData[lastSameServerIndx].servicedBy
                // }
                // temp.push(tmpLastServer)
                // console.log(temp, 'temp')
                

                for(let f=0; f<tmpServData.length; f++){
                  // if(c==0){
                  //   tmpServData[c].status = "free"
                  // }
                  // if(c!=0){
                  if( tmpArrServData[i].arrivalTime > tmpServData[f].endTime){
                    tmpServData[f].status = "free"
                                    
                    let getServer = allServerStatus.find(item => item.serverNo == tmpServData[f].servicedBy)
                    getServer['status'] = 'free';
                  }
                  else if( tmpArrServData[i].arrivalTime < tmpServData[f].endTime){
                    tmpServData[f].status = "busy"
                    let getServer = allServerStatus.find(item => item.serverNo == tmpServData[f].servicedBy)
                    getServer['status'] = 'busy';
                  }
                  // }
                }
              console.log(allServerStatus);

              let lastSameServerIndx;
              let lastSameServerEndTimes = [];
              let nextAvailServer;
                  let freeServer = allServerStatus.find(x => x.status == "free")
                  if(freeServer != null){
                  
                    let lastSameServerIndx = lastIndexOf(tmpServData, freeServer.serverNo); 
                    if(lastSameServerIndx != -1){
                    let data = {
                          customer: i+1,
                          interArrival: this.custArrvData[i].interArrvTime,
                          arrivalTime:tmpArrServData[i].arrivalTime,
                          startTime: tmpArrServData[i].arrivalTime < tmpServData[lastSameServerIndx].endTime ? tmpServData[lastSameServerIndx].endTime : tmpArrServData[i].arrivalTime,
                          endTime: tmpArrServData[i].arrivalTime < tmpServData[lastSameServerIndx].endTime ? tmpServData[lastSameServerIndx].endTime + tmpArrServData[i].serviceTime : tmpArrServData[i].arrivalTime + tmpArrServData[i].serviceTime,
                          // servicedBy: serverFree.serverNo,
                          servicedBy: freeServer.serverNo,
                          serverUtilization: tmpArrServData[i].serviceTime,
                          turnAround: (tmpArrServData[i].arrivalTime < tmpServData[lastSameServerIndx].endTime ? tmpServData[lastSameServerIndx].endTime + tmpArrServData[i].serviceTime : tmpArrServData[i].arrivalTime + tmpArrServData[i].serviceTime) - tmpArrServData[i].arrivalTime,
                          waitTimeQueue: ((tmpArrServData[i].arrivalTime < tmpServData[lastSameServerIndx].endTime ? tmpServData[lastSameServerIndx].endTime + tmpArrServData[i].serviceTime : tmpArrServData[i].arrivalTime + tmpArrServData[i].serviceTime) - tmpArrServData[i].arrivalTime) - tmpArrServData[i].serviceTime,
                          responseTime: (tmpArrServData[i].arrivalTime < tmpServData[lastSameServerIndx].endTime ? tmpServData[lastSameServerIndx].endTime : tmpArrServData[i].arrivalTime) - tmpArrServData[i].arrivalTime
                      };
                      tmpServData.push(data);
                    }

                    else{
                      let data = {
                        customer: i+1,
                        interArrival: this.custArrvData[i].interArrvTime,
                        arrivalTime:tmpArrServData[i].arrivalTime,
                        startTime: tmpArrServData[i].arrivalTime,
                        endTime: tmpArrServData[i].arrivalTime + tmpArrServData[i].serviceTime,
                         // servicedBy: serverFree.serverNo,
                         servicedBy: freeServer.serverNo,
                         serverUtilization: tmpArrServData[i].serviceTime,
                         turnAround: (tmpArrServData[i].arrivalTime + tmpArrServData[i].serviceTime) - tmpArrServData[i].arrivalTime,
                         waitTimeQueue: ((tmpArrServData[i].arrivalTime + tmpArrServData[i].serviceTime) - tmpArrServData[i].arrivalTime) - tmpArrServData[i].serviceTime,
                         responseTime: tmpArrServData[i].arrivalTime - tmpArrServData[i].arrivalTime
                      }
                      tmpServData.push(data);
                    }
                  }
                  else{

                    for(let p=0; p<allServerStatus.length; p++){
                      lastSameServerIndx = lastIndexOf(tmpServData, allServerStatus[p].serverNo); 
                      let data = {
                        serverNo: tmpServData[lastSameServerIndx].servicedBy,
                        endTime: tmpServData[lastSameServerIndx].endTime
                      }
                      lastSameServerEndTimes.push(data)
                    }
                    nextAvailServer = lastSameServerEndTimes.reduce(function(res, obj) {
                        return (obj.endTime < res.endTime) ? obj : res;
                    });

                    let data = {
                          customer: i+1,
                          interArrival: this.custArrvData[i].interArrvTime,
                          arrivalTime:tmpArrServData[i].arrivalTime,
                          startTime: tmpArrServData[i].arrivalTime < nextAvailServer.endTime ? nextAvailServer.endTime : tmpArrServData[i].arrivalTime,
                          endTime: tmpArrServData[i].arrivalTime < nextAvailServer.endTime ? nextAvailServer.endTime + tmpArrServData[i].serviceTime : tmpArrServData[i].arrivalTime + tmpArrServData[i].serviceTime,
                          // servicedBy: serverFree.serverNo,
                          servicedBy: nextAvailServer.serverNo,
                          serverUtilization: tmpArrServData[i].serviceTime,
                          turnAround: (tmpArrServData[i].arrivalTime < nextAvailServer.endTime ? nextAvailServer.endTime + tmpArrServData[i].serviceTime : tmpArrServData[i].arrivalTime + tmpArrServData[i].serviceTime) - tmpArrServData[i].arrivalTime,
                          waitTimeQueue: ((tmpArrServData[i].arrivalTime < nextAvailServer.endTime ? nextAvailServer.endTime + tmpArrServData[i].serviceTime : tmpArrServData[i].arrivalTime + tmpArrServData[i].serviceTime) - tmpArrServData[i].arrivalTime) - tmpArrServData[i].serviceTime,
                          responseTime: (tmpArrServData[i].arrivalTime < nextAvailServer.endTime ? nextAvailServer.endTime : tmpArrServData[i].arrivalTime) - tmpArrServData[i].arrivalTime
                      };
                      tmpServData.push(data);
                    }
                    console.log(i);
                    // console.log(tmpServData);
        // }

        // if (tmpServData.length > 1) {
        //     if (tmpArrServData[i].arrivalTime < tmpServData[i - 1].endTime) {
        //         let serverToIgnore;
        //         let serverFree;
        //         console.log(i);

        //         for (let l = 0; l < tmpServData.length; l++) {
        //             if (tmpArrServData[i].arrivalTime < tmpServData[l].endTime) {
        //                 serverToIgnore = tmpServData[l].servicedBy;
        //                 // console.log("current arrival rate lie in" + serverToIgnore)

        //                 serverFree = allServerStatus.find((item) => item.serverNo != serverToIgnore);
        //             }
        //         }

        //         // let getServer = allServerStatus.find(item => item.status === 'free')
        //         // getServer['status'] = 'busy';

        //         let data = {
        //             startTime: tmpArrServData[i].arrivalTime,
        //             endTime: tmpArrServData[i].arrivalTime + tmpArrServData[i].serviceTime,
        //             servicedBy: serverFree.serverNo,
        //         };
        //         tmpServData.push(data);

        //         console.log(tmpServData);
        //     } else if (tmpArrServData[i].arrivalTime > tmpServData[i - 1].endTime) {
        //         let serverToIgnore;
        //         let serverFree;
        //         console.log(i);
        //         console.log(tmpServData);
        //         console.log(tmpServData[i - 1]);
        //         for (let m = 0; m < tmpServData.length; m++) {
        //             if (tmpArrServData[i].arrivalTime < tmpServData[m].endTime) {
        //                 serverToIgnore = tmpServData[m].servicedBy;
        //                 // console.log("current arrival rate lie in" + serverToIgnore)

        //                 serverFree = allServerStatus.find((item) => item.serverNo != serverToIgnore);
        //                 console.log(serverFree);
        //             }
        //         }
        //         let data = {
        //             startTime: tmpArrServData[i].arrivalTime,
        //             endTime: tmpArrServData[i].arrivalTime + tmpArrServData[i].serviceTime,
        //             servicedBy: serverFree.serverNo,
        //         };
        //         tmpServData.push(data);

        //         console.log(tmpServData);
        //     }
        // }
    }
    // else if(tmpArrServData[i].arrivalTime > tmpServData[i-1].startTime &&
    //         tmpArrServData[i].arrivalTime < tmpServData[i-1].endTime)
}

    



    // for (let i = 0; i < tmpArrServData.length; i++) {
    //   if (i == 0) {
        
    //       serv1 = "busy";
    //       let data = {
    //         startTime: tmpArrServData[i].arrivalTime,
    //         endTime: tmpArrServData[i].arrivalTime + tmpArrServData[i].serviceTime,
    //         servicedBy: "server1",
    //       };
    //       tmpServData.push(data);

    //   }
    //   else {
    //     var largestServiceTimeData = tmpServData.reduce(function(prev, current) {
    //         if (+current.endTime > +prev.endTime) {
    //             return current;
    //         } else {
    //             return prev;
    //         }
    //     });
    //     console.log(largestServiceTimeData)
        
    //     let lastServ1DataIndex = tmpServData.lastIndexOf("server1")
    //     let lastServer1Data;
    //     if(lastServ1DataIndex != null){
    //       lastServer1Data = tmpServData[lastServ1DataIndex]
    //     }

    //     let lastServ2DataIndex = tmpServData.lastIndexOf("server2")
    //     let lastServer2Data;
    //     if(lastServ2DataIndex != null){
    //       lastServer2Data = tmpServData[lastServ2DataIndex]
    //     }
        
    //     if((tmpArrServData[i].arrivalTime < largestServiceTimeData.endTime) && largestServiceTimeData.servicedBy == "server1"){

    //           if(lastServer2Data == null){
    //             serv2 = "busy";
    //             let data = {
    //               startTime: tmpArrServData[i].arrivalTime,
    //               endTime: tmpArrServData[i].arrivalTime + tmpArrServData[i].serviceTime,
    //               servicedBy: "server2",
    //             };
    //             tmpServData.push(data);
    //           }

    //           else if(tmpArrServData[i].arrivalTime > lastServer2Data.endTime && lastServer2Data != null){
    //             serv2 = "busy";
    //             let data = {
    //               startTime: tmpArrServData[i].arrivalTime,
    //               endTime: tmpArrServData[i].arrivalTime + tmpArrServData[i].serviceTime,
    //               servicedBy: "server2",
    //             };
    //             tmpServData.push(data);
    //           }

    //           else if(tmpArrServData[i].arrivalTime < lastServer2Data.endTime && lastServer2Data != null){
    //             serv2 = "busy";
    //             let data = {
    //               startTime: lastServer2Data.endTime,
    //               endTime: lastServer2Data.endTime + tmpArrServData[i].serviceTime,
    //               servicedBy: "server2",
    //             };
    //             tmpServData.push(data);
    //           }
         
    //     }
    //     if((tmpArrServData[i].arrivalTime < largestServiceTimeData.endTime) &&  largestServiceTimeData.servicedBy == "server2"){

    //       if(tmpArrServData[i].arrivalTime > lastServer1Data.endTime){
    //         serv1 = "busy";
    //         let data = {
    //           startTime: tmpArrServData[i].arrivalTime,
    //           endTime: tmpArrServData[i].arrivalTime + tmpArrServData[i].serviceTime,
    //           servicedBy: "server1",
    //         };
    //         tmpServData.push(data);
    //       }

    //       if(tmpArrServData[i].arrivalTime < lastServer1Data.endTime){
    //         serv1 = "busy";
    //         let data = {
    //           startTime: lastServer1Data.endTime,
    //           endTime: lastServer1Data.endTime + tmpArrServData[i].serviceTime,
    //           servicedBy: "server2",
    //         };
    //         tmpServData.push(data);
    //       }
         
    //     }
    //     else if ((tmpArrServData[i].arrivalTime > largestServiceTimeData.endTime) && largestServiceTimeData.servicedBy == "server1"){
    //       serv1 = "busy";
    //       let data = {
    //         startTime: tmpArrServData[i].arrivalTime,
    //         endTime: tmpArrServData[i].arrivalTime + tmpArrServData[i].serviceTime,
    //         servicedBy: "server1",
    //       };
    //       tmpServData.push(data);
    //     }
    //     else if ((tmpArrServData[i].arrivalTime > largestServiceTimeData.endTime) && largestServiceTimeData.servicedBy == "server2"){
    //       serv1 = "busy";
    //       let data = {
    //         startTime: tmpArrServData[i].arrivalTime,
    //         endTime: tmpArrServData[i].arrivalTime + tmpArrServData[i].serviceTime,
    //         servicedBy: "server2",
    //       };
    //       tmpServData.push(data);
    //     }
    //   }
    // }
    console.log(tmpServData);
  }


  //total inter arrival time
  let totaInterArrvTime = this.custArrvData.reduce((accumulator, object) => {
    return accumulator + object.interArrvTime;
  }, 0);

  console.log(totaInterArrvTime, 'total inter arrival time')

  //total service time
  let totalServiceTime = tmpArrServData.reduce((accumulator, object) => {
    return accumulator + object.serviceTime;
  }, 0);

  console.log(totalServiceTime, 'total service time')



  let tmpServUtil = []
  tmpServData.forEach(element => {
    let data = {
      servicedBy: element.servicedBy,
      serverUtilization: element.serverUtilization
    }
    tmpServUtil.push(data)
  });
  console.log(tmpServUtil)

  //total server utilization
  let totalServerUtil = Object.values(
    tmpServUtil.reduce((acc, item) => {
      acc[item.servicedBy] = acc[item.servicedBy]
        ? { ...item, serverUtilization: item.serverUtilization + acc[item.servicedBy].serverUtilization }
        : item;
      return acc;
    }, {})
  );

  console.log(totalServerUtil, 'total server util')

    //turn around time
    let totalTurnAroundTime = tmpServData.reduce((accumulator, object) => {
      return accumulator + object.turnAround;
    }, 0);
  
    console.log(totalTurnAroundTime, 'total turn around time')

    //wait in queue time
    let totalWaiInQueueTime = tmpServData.reduce((accumulator, object) => {
      return accumulator + object.waitTimeQueue;
    }, 0);
  
    console.log(totalWaiInQueueTime, 'total wait in queue time')


    //response time
    let totaResponseTime = tmpServData.reduce((accumulator, object) => {
      return accumulator + object.responseTime;
    }, 0);
  
    console.log(totaResponseTime, 'total response time')

    //avg time spent in hospital
    let avgTimeSpentInSystem = totalTurnAroundTime/tmpServData.length
    console.log(avgTimeSpentInSystem, 'avg time spent in hospital')

    //avg wait time 
    let avgWaitTime = totalWaiInQueueTime/tmpServData.length
    console.log(avgWaitTime, 'avg wait time ')

    //avg response time
    let avgResponseTime = totaResponseTime/tmpServData.length
    console.log(avgResponseTime, 'avg response time')

    //mean service time
    let meanServiceTime = totalServiceTime/tmpServData.length
    console.log(meanServiceTime, 'mean service time')

    //avg time bw arrival of patient
    let avgTimeBwArrival = totaInterArrvTime/(tmpServData.length - 1)
    console.log(avgTimeBwArrival, 'avg time bw arrival of patient')

    //avg waiting time of those who wait
    // let avgWaitingTimeWhoWait = totalWaiInQueueTime/(tmpServData.length - 1)


    //all server utilizations
    let serverUtilRate = []


    totalServerUtil.forEach(element => {
      const data = {
        serverNo: element['servicedBy'],
        serverUtilRate: (element['serverUtilization']/totalServiceTime)*100
      }
      serverUtilRate.push(data)
    });
    console.log(serverUtilRate, 'server utilization rate')

    this.sendSimulationData(
      tmpServData,
      totaInterArrvTime,
      totalServiceTime,
      totalServerUtil,
      totalTurnAroundTime,
      totalWaiInQueueTime,
      totaResponseTime,
      avgTimeSpentInSystem,
      avgWaitTime,
      avgResponseTime,
      meanServiceTime,
      avgTimeBwArrival,
      serverUtilRate
      )

  }

  sendSimulationData(
    tmpServData,
    totaInterArrvTime,
    totalServiceTime,
    totalServerUtil,
    totalTurnAroundTime,
    totalWaiInQueueTime,
    totaResponseTime,
    avgTimeSpentInSystem,
    avgWaitTime,
    avgResponseTime,
    meanServiceTime,
    avgTimeBwArrival,
    serviceUtilRate
  ){
    let tmpCustArrvData = this.custArrvData
    let tmpServDistTime = this.distServTimeData
    let data = {
      tmpServData,
      tmpCustArrvData,
      tmpServDistTime,
      totaInterArrvTime,
      totalServiceTime,
      totalServerUtil,
      totalTurnAroundTime,
      totalWaiInQueueTime,
      totaResponseTime,
      avgTimeSpentInSystem,
      avgWaitTime,
      avgResponseTime,
      meanServiceTime,
      avgTimeBwArrival,
      serviceUtilRate
    }
    this.simData.emit(data);
  }

  refreshDoctorTbl() {
    this.refreshTbl = true;
    this.refreshDocTbl.emit(this.refreshTbl);
  }

  closeModal() {
    this.activeModal.dismiss("Cross click");
  }
}
