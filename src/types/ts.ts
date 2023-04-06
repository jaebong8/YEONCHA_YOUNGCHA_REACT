
import { Timestamp } from "firebase/firestore";

export interface WorkerType {
    birthDate: string;
    name: string;
    phoneNumber: string;
    role: string;
    workStartDate: string;
    workerUid: string ;
    userUid?: string;
    [key:string]: number | string | undefined;
    workYear: number
    adminUid?: string 
} 

export interface UserType {
    company : string;
    email: string;
    workers?: WorkerType;
    birthDate?: string;
    name?: string;
    phoneNumber?: string;
    role: string;
    workStartDate?: string;
    workerUid?: string ;
    userUid: string;
    adminUid?: string 

}

export interface DocType {
    createdAt:Timestamp
    documentUid:string;
    endDate:string;
    name:string;
    startDate:string;
    status:string;
    title:string;
    type:string;
    userUid:string;
    date:string;
    reject?: string;
    color:string;
}

export interface UserInfoContext {
    userInfo: UserType;
    userUid: string;
}

export interface RegisterWorker extends RegisterAdmin {
    birthDate: Date;
    phoneNumber: string;
    workStartDate: Date;
    workerUid: string ;
    name: string;
}

export interface RegisterAdmin extends Login{
    passwordCheck: string;
    companyName: string;
}

export interface Login {
    email: string;
    password: string;
}

export interface IDoc {
    title: string;
    type:string;
    selectDate: Date[];
}