export class Doctor {
    id:number=0;
    name:string;
    lastName:string;
    gender:string;
    qualification:string;
    experience:string;
    isActive:number;
    designationId:number=0;
}

export class Patient {
    id:number=0;
    name:string;
    lastName:string;
    gender:string;
    diagnosis:string;
    treatedByDoctor:string;
    prescription:string;
    isActive:number;
    designationId:number=0;
}

export class Session {
    id:number=0;
    date:any;
    totalDoctorsOnService:number;
    totalPatientsArrived:number;
    totalTimeOfEachSession:string;
    AveragePatientServiceTime:string;
}
